
import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from "../constants";

// Fix: Initialize GoogleGenAI with direct process.env.API_KEY as per instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getShoppingAdvice = async (userPrompt: string, cartItems: any[]) => {
  try {
    const productsContext = PRODUCTS.map(p => `${p.nameAr} (${p.category}) - ${p.price} MAD`).join(', ');
    const cartContext = cartItems.length > 0 
      ? `المستخدم لديه حالياً ${cartItems.map(i => i.nameAr).join(', ')} في سلة التسوق.` 
      : "سلة التسوق فارغة حالياً.";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `أنت مساعد تسوق مغربي ودود لمتجر "Matjar Maroc". 
      ساعد المستخدم في العثور على منتجات من الكتالوج الخاص بنا أو قدم له نصائح شرائية.
      كتالوج المنتجات: ${productsContext}.
      ${cartContext}
      
      طلب المستخدم: ${userPrompt}
      
      يجب أن تكون إجابتك باللغة العربية بلهجة مهنية ومرحبة (مغربية إن أمكن ولكن مفهومة للجميع). 
      اجعل الردود مختصرة ومفيدة وركز على بيع المنتجات الموجودة في الكتالوج.`
    });

    return response.text || "عذراً، لم أتمكن من معالجة طلبك حالياً.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "المساعد الذكي غير متاح حالياً، يرجى المحاولة لاحقاً.";
  }
};
