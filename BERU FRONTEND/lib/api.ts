const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

const handleResponse = async (res: Response) => {
  const contentType = res.headers.get("content-type");
  const data = contentType?.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    console.error(`API Error ${res.status}:`, data);
    throw {
      status: res.status,
      message: data?.detail || data?.error || `Error ${res.status}`,
      data,
    };
  }
  return data;
};

export const api = {
  getEquipment: async () => {
    try {
      console.log("Fetching equipment from:", `${API_URL}/equipment`);
      const res = await fetch(`${API_URL}/equipment`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return await handleResponse(res);
    } catch (error: any) {
      console.error("Error fetching equipment:", error);
      throw error;
    }
  },

  createEquipment: async (data: any) => {
    try {
      console.log("Creating equipment:", data);
      const res = await fetch(`${API_URL}/equipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return await handleResponse(res);
    } catch (error: any) {
      console.error("Error creating equipment:", error);
      throw error;
    }
  },

  updateEquipment: async (id: number, data: any) => {
    try {
      const res = await fetch(`${API_URL}/equipment/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return await handleResponse(res);
    } catch (error: any) {
      console.error("Error updating equipment:", error);
      throw error;
    }
  },

  deleteEquipment: async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/equipment/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return await handleResponse(res);
    } catch (error: any) {
      console.error("Error deleting equipment:", error);
      throw error;
    }
  },
};