
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
      1. تقديم المشورة التقنية ومراجعات المنتجات.
      2. تقديم نصائح في مجال "الافلييت" (التسويق بالعمولة) والربح من الإنترنت.
      3. تقديم توجيهات في "تطوير الذات" والإنتاجية للعاملين في المجال الرقمي.
      4. تلخيص أخبار المغرب التقنية.
      5. ترشيح مقالات من مدونتنا للمستخدم بناءً على سؤاله.
      
      مقالاتنا المتوفرة حالياً: ${blogContext}.
      
      طلب المستخدم: ${userPrompt}
      
      تعليمات الرد:
      - تحدث باللغة العربية بأسلوب مهذب ومحفز.
      - إذا سألك المستخدم عن "الافلييت" أو "تطوير الذات"، قدم له نصائح عملية تتماشى مع توجهات المدونة الجديدة.
      - شجعه دائماً على متابعة جديد التكنولوجيا في المغرب عبر موقعنا.`
    });

    return response.text || "عذراً، لم أتمكن من معالجة طلبك حالياً. جرب مرة أخرى!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "المساعد الذكي يواجه عطلاً فنياً بسيطاً. سنعود قريباً!";
  }
};
