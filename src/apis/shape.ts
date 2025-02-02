import axiosInstance from "../axios"

export const createShape = async (data , callback): Promise<void> => {
    try {
      const response = await axiosInstance.post('/shape', data);
      if(callback) callback(); 
    } catch (error) {
      console.error('Error creating circle:', error);
    }
  };

  export const updateShape = async (id, data , callback): Promise<void> => {
    try {
      const response = await axiosInstance.post(`/shape/${id}`, data);
      if(callback) callback(); 
    } catch (error) {
      console.error('Error creating circle:', error);
    }
  };

  export const deleteShape = async (id, callback):Promise<void> => {
    try {
      const response = await axiosInstance.delete(`/shape/${id}`);
      if(callback) callback(); 
    } catch (error) {
      console.error("There was an error updating the data:", error);
    }
  };

  export const createRoute = async (data , callback): Promise<void> => {
    try {
      const response = await axiosInstance.post('/routes', data);
      if(callback) callback(); 
    } catch (error) {
      console.error('Error creating circle:', error);
    }
  };

  

  export const updateRoute = async (id, data , callback):Promise<void> => {
    try {
      const response = await axiosInstance.put(`/api/routes/${id}`, data);
      if(callback) callback(); 
    } catch (error) {
      console.error("There was an error updating the data:", error);
    }
  };

  export const deleteRoute = async (id, callback):Promise<void> => {
    try {
      const response = await axiosInstance.delete(`/api/routes/${id}`);
      if(callback) callback(); 
    } catch (error) {
      console.error("There was an error updating the data:", error);
    }
  };
