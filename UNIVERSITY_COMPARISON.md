# University Comparison Feature

## Overview
This feature allows users to compare Haliç University programs with similar programs from other universities based on entrance exam scores and rankings.

## Files Created

### Utilities
- `/src/utils/csvParser.js` - Handles CSV parsing with Turkish number format
- `/src/utils/dataFilters.js` - Data filtering and processing functions

### Components
- `/src/components/UniversityComparison/YearSelector.js` - Year selection dropdown
- `/src/components/UniversityComparison/ProgramSelector.js` - Program selection dropdown
- `/src/components/UniversityComparison/MetricSelector.js` - Metric selection (Ranking/Score)
- `/src/components/UniversityComparison/BufferSlider.js` - Buffer percentage slider
- `/src/components/UniversityComparison/ComparisonChart.js` - Box plot visualization
- `/src/components/UniversityComparison/DepartmentList.js` - Sortable table of matched programs

### Pages
- `/src/pages/UniversityComparison.js` - Main page component

### Data
- `/public/assets/data/halic_programs.csv` - Haliç University programs data
- `/public/assets/data/all_universities_programs_master.csv` - All universities data

## How It Works

1. **Year Selection**: User selects a year (2022, 2023, or 2024)
2. **Program Filtering**: Only Haliç programs with data for the selected year are shown
3. **Program Selection**: User selects a Haliç program to compare
4. **Metric Selection**: User chooses to compare by ranking or score
5. **Buffer Adjustment**: User sets tolerance percentage (0-50%)
6. **Results Display**: 
   - Box plot chart showing similar programs grouped by university
   - Sortable table listing all matched programs

## Buffer Logic

The buffer expands the comparison range:
- For a 10% buffer on a program with ranking 10,000-20,000:
  - Search range becomes 9,000-22,000 (10% on both sides)
- Programs from other universities with overlapping ranges are included

## Navigation

Access the feature from the Dashboard by clicking the "Üniversite Karşılaştırma" button.

Direct URL: `/university-comparison`

## Technical Notes

- Uses Chart.js for visualization
- Material-UI for components
- Handles Turkish number format (comma as decimal separator)
- Filters by same puan_type (score type: say, ea, söz, dil)
- Sorts and displays university types with color coding
