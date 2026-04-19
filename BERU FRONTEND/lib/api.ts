const API_URL = "http://localhost:8000";

export const api = {
  getEquipment: async () => {
    const res = await fetch(`${API_URL}/equipment`);
    return res.json();
  },

  createEquipment: async (data: any) => {
    const res = await fetch(`${API_URL}/equipment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return res.json();
  },
};