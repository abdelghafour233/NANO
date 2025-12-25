
import { GoogleGenAI } from "@google/genai";
import { ARTICLES } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getShoppingAdvice = async (userPrompt: string, _context: any[]) => {
  try {
    const blogContext = ARTICLES.map(a => `${a.title} (تصنيف: ${a.category})`).join(', ');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `أنت "عبدو ويب بوت"، المساعد الذكي لمدونة AbdouWeb التقنية المغربية الرائدة.
      
      اختصاصك:
      1. تقديم المشورة التقنية (هواتف، لابتوبات، برمجيات).
      2. تلخيص أخبار المغرب التقنية والاقتصادية.
      3. ترشيح مقالات من مدونتنا للمستخدم بناءً على سؤاله.
      
      مقالاتنا المتوفرة حالياً: ${blogContext}.
      
      طلب المستخدم: ${userPrompt}
      
      تعليمات الرد:
      - تحدث باللغة العربية (يمكنك استخدام بعض المصطلحات المغربية التقنية الدارجة).
      - كن محترفاً، ذكياً، ومختصراً.
      - إذا سألك عن منتج غير موجود في قائمتنا، أعطه نصيحة عامة بناءً على خبرتك كخبير تقني.
      - شجعه دائماً على متابعة جديد التكنولوجيا في المغرب عبر موقعنا.`
    });

    return response.text || "عذراً، لم أتمكن من معالجة طلبك التقني حالياً. جرب مرة أخرى!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "المساعد الذكي يواجه عطلاً فنياً بسيطاً. سنعود قريباً!";
  }
};
