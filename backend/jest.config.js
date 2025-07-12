export default {
    transform: {
      "^.+\\.js$": "babel-jest",
    },
    testEnvironment: "node",
    transformIgnorePatterns: [
      "/node_modules/(?!drizzle-orm|pg).+\\.js$"
    ],
  };
  