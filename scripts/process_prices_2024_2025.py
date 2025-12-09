#!/usr/bin/env python3
"""
Process the new price collection document (2024-2025) and generate
the all_programs_prices_processed.csv file with proper matching.

Key logic:
1. Price document has BASE prices (Ücretli - full fee) for each university+program
2. Master file has different yop_kodu for each scholarship variant (Burslu, %25, %50, %75, Ücretli)
3. We match base prices to ALL scholarship variants and calculate discounted prices
4. Store both 2024 and 2025 prices separately for year-based display
"""

import csv
import re
from collections import defaultdict

def parse_price(price_str):
    """
    Parse price string in various formats:
    - '₺450,000.00' (US format with comma as thousands)
    - '455.000₺' (Turkish format with dot as thousands)
    - '1.127.500₺' (Turkish format with dots)
    """
    if not price_str or not isinstance(price_str, str):
        return None
    
    # Check for full scholarship indicators
    full_scholarship_keywords = [
        'sadece tam burslu',
        'yalnızca tam burs',
        'tam burslu alımı',
        'sadece burslu'
    ]
    
    price_lower = price_str.lower().strip()
    for keyword in full_scholarship_keywords:
        if keyword in price_lower:
            return 0  # Full scholarship = 0 price
    
    # Remove currency symbol and spaces
    cleaned = price_str.replace('₺', '').replace(' ', '').strip()
    
    # Detect format by checking pattern
    # US format: 450,000.00 (comma for thousands, dot for decimal)
    # Turkish format: 450.000 or 1.127.500 (dot for thousands, no decimal part typically)
    
    if ',' in cleaned and '.' in cleaned:
        # US format: remove commas, keep dot for decimal
        cleaned = cleaned.replace(',', '')
    elif '.' in cleaned and cleaned.count('.') >= 1:
        # Check if it's Turkish format (dots as thousands separators)
        # In Turkish format, dots separate thousands and there's no decimal part
        # E.g., "1.127.500" or "455.000"
        parts = cleaned.split('.')
        if all(len(p) == 3 for p in parts[1:]):  # Check if dots are at thousands positions
            # Turkish format: remove dots
            cleaned = cleaned.replace('.', '')
        # else it might be a decimal number like "455.00" - keep as is
    elif ',' in cleaned:
        # Could be Turkish decimal (rare) or just thousands - try removing
        cleaned = cleaned.replace(',', '')
    
    try:
        return float(cleaned)
    except ValueError:
        return None

def normalize_university_name(name):
    """Normalize university name for matching"""
    if not name:
        return ""
    
    # Remove city in parentheses and normalize
    name = re.sub(r'\s*\([^)]*\)\s*', ' ', name)
    name = name.upper().strip()
    name = ' '.join(name.split())  # Normalize whitespace
    
    # Common variations
    replacements = {
        'ÜNİVERSİTESİ': 'ÜNİVERSİTESİ',
        'UNIVERSITESI': 'ÜNİVERSİTESİ',
        '(İNG)': '',
    }
    
    for old, new in replacements.items():
        name = name.replace(old, new)
    
    return name.strip()

def normalize_program_name(name):
    """Normalize program name for matching"""
    if not name:
        return ""
    
    name = name.upper().strip()
    
    # Remove common suffixes that don't affect matching
    patterns_to_remove = [
        r'\s*\(İNGİLİZCE\)\s*',
        r'\s*\(TÜRKÇE\)\s*',
        r'\s*\(\d+ YILLIK\)\s*',
        r'\s*İNGİLİZCE\s*$',
        r'\s*TÜRKÇE\s*$',
        r'\s*\(ÜCRETLİ\)\s*',
        r'\s*\(BURSLU\)\s*',
        r'\s*ÜCRETLİ\s*$',
        r'\s*BURSLU\s*$',
        r'\s*\(%\d+\s*İNDİRİMLİ\)\s*',  # Remove scholarship percentages
    ]
    
    for pattern in patterns_to_remove:
        name = re.sub(pattern, ' ', name, flags=re.IGNORECASE)
    
    name = ' '.join(name.split())
    return name.strip()

def is_english_program(name, program_detail=''):
    """Check if program is English-taught"""
    if not name:
        return False
    combined = (name + ' ' + program_detail).lower()
    return 'ingilizce' in combined or '(ing)' in combined

def get_scholarship_pct(scholarship_str):
    """Convert scholarship string to percentage"""
    if not scholarship_str:
        return 0
    scholarship = scholarship_str.upper().strip()
    
    if scholarship == 'BURSLU' or 'TAM BURS' in scholarship or '100' in scholarship:
        return 100
    elif '%75' in scholarship or '75' in scholarship:
        return 75
    elif '%50' in scholarship or '50' in scholarship or 'YARIM' in scholarship:
        return 50
    elif '%25' in scholarship or '25' in scholarship:
        return 25
    elif scholarship == 'ÜCRETLİ' or scholarship == 'UCRETLI':
        return 0
    elif scholarship == 'ÜCRETSİZ' or scholarship == 'UCRETSIZ':
        return 100  # State universities - free
    return 0

def load_master_data(filepath):
    """Load master data for matching programs"""
    programs = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            scholarship = row.get('scholarship', '')
            scholarship_pct = get_scholarship_pct(scholarship)
            
            programs.append({
                'yop_kodu': row['yop_kodu'],
                'university': row['university'],
                'university_normalized': normalize_university_name(row['university']),
                'program': row['program'],
                'program_normalized': normalize_program_name(row['program']),
                'program_detail': row.get('program_detail', ''),
                'scholarship': scholarship,
                'scholarship_pct': scholarship_pct,
                'university_type': row.get('university_type', ''),
            })
    
    return programs

def find_all_matching_programs(university, program, master_data):
    """
    Find ALL matching programs from master data (all scholarship variants).
    Returns list of matching programs with their yop_kodu and scholarship info.
    """
    uni_norm = normalize_university_name(university)
    prog_norm = normalize_program_name(program)
    is_english = is_english_program(program)
    
    matches = []
    
    for master_prog in master_data:
        if master_prog['university_normalized'] != uni_norm:
            continue
        
        if master_prog['program_normalized'] == prog_norm:
            # Check if English status matches
            master_is_english = is_english_program(
                master_prog['program'], 
                master_prog.get('program_detail', '')
            )
            
            if is_english == master_is_english:
                matches.append(master_prog)
    
    # If no exact English match, try without English filter
    if not matches:
        for master_prog in master_data:
            if master_prog['university_normalized'] != uni_norm:
                continue
            if master_prog['program_normalized'] == prog_norm:
                matches.append(master_prog)
    
    return matches

def main():
    # File paths
    new_price_file = '/Users/ogulcangunaydin/Projects/educaition-react/public/assets/data/price_collection_document_2024_2025.csv'
    master_file = '/Users/ogulcangunaydin/Projects/educaition-react/public/assets/data/all_universities_programs_master.csv'
    master_file_2025 = '/Users/ogulcangunaydin/Projects/educaition-react/public/assets/data_2025/all_universities_programs_master.csv'
    output_file = '/Users/ogulcangunaydin/Projects/educaition-react/public/assets/data/all_programs_prices_processed.csv'
    
    # Load master data from both years
    print("Loading master data...")
    master_data = load_master_data(master_file)
    master_2024_count = len(master_data)
    
    try:
        master_data_2025 = load_master_data(master_file_2025)
        master_data.extend(master_data_2025)
        print(f"Loaded {master_2024_count} programs from 2024 master, {len(master_data_2025)} from 2025 master")
    except FileNotFoundError:
        print("2025 master file not found, using only main master file")
    
    print(f"Total master programs: {len(master_data)}")
    
    # Create index by university+program for quick lookup
    program_index = defaultdict(list)
    for prog in master_data:
        key = (prog['university_normalized'], prog['program_normalized'])
        program_index[key].append(prog)
    
    # Parse new price document and create price lookup
    print("Processing new price document...")
    
    # price_lookup: (uni_norm, prog_norm, is_english) -> {price_2024, price_2025}
    price_lookup = {}
    rows_processed = 0
    
    with open(new_price_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            rows_processed += 1
            university = row.get('original_university', '').strip()
            program = row.get('original_department', '').strip()
            price_2025_str = row.get('original_price_2025', '').strip()
            price_2024_str = row.get('price_2024_TL', '').strip()
            
            # Parse prices
            price_2025 = parse_price(price_2025_str)
            price_2024 = parse_price(price_2024_str)
            
            if price_2025 is None and price_2024 is None:
                continue
            
            uni_norm = normalize_university_name(university)
            prog_norm = normalize_program_name(program)
            is_english = is_english_program(program)
            
            key = (uni_norm, prog_norm, is_english)
            
            # Store prices (overwrite if already exists to get latest)
            if key not in price_lookup:
                price_lookup[key] = {'price_2024': None, 'price_2025': None}
            
            if price_2025 is not None:
                price_lookup[key]['price_2025'] = price_2025
            if price_2024 is not None:
                price_lookup[key]['price_2024'] = price_2024
    
    print(f"Processed {rows_processed} rows from price document")
    print(f"Unique university+program combinations with prices: {len(price_lookup)}")
    
    # Now match prices to ALL programs in master data
    print("Matching prices to master programs...")
    output_rows = []
    matched_programs = 0
    unmatched_programs = 0
    
    # Track which master programs we've processed
    processed_yop_kodlar = set()
    
    for master_prog in master_data:
        yop_kodu = master_prog['yop_kodu']
        
        # Skip if already processed (same yop_kodu from 2024 and 2025)
        if yop_kodu in processed_yop_kodlar:
            continue
        processed_yop_kodlar.add(yop_kodu)
        
        # Skip state universities (Ücretsiz - free)
        if master_prog['university_type'] == 'Devlet':
            continue
        
        uni_norm = master_prog['university_normalized']
        prog_norm = master_prog['program_normalized']
        is_english = is_english_program(
            master_prog['program'],
            master_prog.get('program_detail', '')
        )
        
        # Try to find price for this program
        key = (uni_norm, prog_norm, is_english)
        prices = price_lookup.get(key)
        
        # If not found with English, try without
        if prices is None:
            key_no_eng = (uni_norm, prog_norm, False)
            prices = price_lookup.get(key_no_eng)
        if prices is None:
            key_eng = (uni_norm, prog_norm, True)
            prices = price_lookup.get(key_eng)
        
        if prices is None:
            unmatched_programs += 1
            continue
        
        matched_programs += 1
        
        # Get the scholarship percentage for this specific yop_kodu
        scholarship_pct = master_prog['scholarship_pct']
        
        # Calculate discounted prices based on scholarship
        discount_multiplier = 1 - (scholarship_pct / 100)
        
        price_2024 = prices.get('price_2024')
        price_2025 = prices.get('price_2025')
        
        discounted_2024 = price_2024 * discount_multiplier if price_2024 is not None else None
        discounted_2025 = price_2025 * discount_multiplier if price_2025 is not None else None
        
        # Format yop_kodu
        formatted_yop_kodu = f"{yop_kodu}.0" if yop_kodu and '.' not in str(yop_kodu) else yop_kodu
        
        output_rows.append({
            'yop_kodu': formatted_yop_kodu,
            'university': master_prog['university'],
            'program': master_prog['program'],
            'is_english': is_english,
            'scholarship_pct': scholarship_pct,
            'full_price_2024': price_2024 if price_2024 is not None else '',
            'full_price_2025': price_2025 if price_2025 is not None else '',
            'discounted_price_2024': discounted_2024 if discounted_2024 is not None else '',
            'discounted_price_2025': discounted_2025 if discounted_2025 is not None else '',
        })
    
    print(f"Matched programs: {matched_programs}")
    print(f"Unmatched programs (no price found): {unmatched_programs}")
    
    # Write output
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        fieldnames = [
            'yop_kodu', 'university', 'program', 'is_english', 'scholarship_pct',
            'full_price_2024', 'full_price_2025', 'discounted_price_2024', 'discounted_price_2025'
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(output_rows)
    
    print(f"Output written to {output_file}")
    print(f"Total rows: {len(output_rows)}")
    
    # Print some statistics about scholarship distribution
    scholarship_counts = defaultdict(int)
    for row in output_rows:
        scholarship_counts[row['scholarship_pct']] += 1
    
    print("\nScholarship distribution:")
    for pct, count in sorted(scholarship_counts.items()):
        print(f"  {pct}%: {count} programs")

if __name__ == '__main__':
    main()
