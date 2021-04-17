export const stripe = {
  charges: {
    create: jest.fn().mockResolvedValue({}), // A promise which resolves with {}
  },
};
