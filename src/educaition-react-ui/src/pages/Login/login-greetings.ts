interface LoginGreeting {
  language: string;
  greeting: string;
}

const LOGIN_GREETINGS: LoginGreeting[] = [
  {
    greeting: "Hallo",
    language: "german",
  },
  {
    greeting: "¡Hola",
    language: "spanish",
  },
  {
    greeting: "Hello",
    language: "english",
  },
  {
    greeting: "Bonjour",
    language: "french",
  },
  {
    greeting: "Ciao",
    language: "italian",
  },
  {
    greeting: "もしもし",
    language: "japanese",
  },
  {
    greeting: "привет",
    language: "russian",
  },
  {
    greeting: "Hallå",
    language: "swedish",
  },
  {
    greeting: "Merhaba",
    language: "turkish",
  },
  {
    greeting: "Sawubona",
    language: "zulu",
  },
  {
    greeting: "مرحبا",
    language: "arabic",
  },
  {
    greeting: "Hallo",
    language: "dutch",
  },
  {
    greeting: "Χαίρετε",
    language: "greek",
  },
];

export const getRandomGreeting = () => {
  const randomizedNumber = Math.floor(Math.random() * LOGIN_GREETINGS.length);
  return LOGIN_GREETINGS[randomizedNumber];
};
