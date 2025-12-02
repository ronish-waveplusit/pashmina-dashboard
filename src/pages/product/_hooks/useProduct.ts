import { useState, useEffect } from "react";

export interface AvailableAttribute {
  id: string;
  name: string;
  values: string[];
}

// Mock API call - replace with actual API endpoint
const fetchAttributes = async (): Promise<AvailableAttribute[]> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "size",
          name: "Size",
          values: ["Small", "Medium", "Large", "X-Large"],
        },
        {
          id: "color",
          name: "Color",
          values: ["Red", "Blue", "Black", "White", "Green"],
        },
        {
          id: "material",
          name: "Material",
          values: ["Cotton", "Polyester", "Silk", "Wool"],
        },
        {
          id: "style",
          name: "Style",
          values: ["Casual", "Formal", "Sport", "Vintage"],
        },
      ]);
    }, 500);
  });
};

export const useProductAttributes = () => {
  const [attributes, setAttributes] = useState<AvailableAttribute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAttributes = async () => {
      try {
        const data = await fetchAttributes();
        setAttributes(data);
      } catch (error) {
        console.error("Failed to fetch attributes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAttributes();
  }, []);

  return { attributes, loading };
};