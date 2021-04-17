export const stripe = {
  charges: {
    create: jest.fn().mockImplementation(async (config) => {
      return { id: "mock_charge_id" };
    }),
  },
};
