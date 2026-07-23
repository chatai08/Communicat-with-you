# Mera Chat App - Individual (Private) Chat

## Kya naya hai
- Ab sirf ek common room nahi, balki **har user ke saath alag (1-to-1) chat** hoti hai.
- Login ke baad **online users ki list** dikhti hai — kisi ek naam par tap karke uske saath private chat khulti hai.
- **Real-time notification**: agar koi aapko message bhejta hai aur aap uski chat nahi khole baithe ho, to:
  - Contacts list mein uske naam ke saamne **unread badge (number)** dikhta hai
  - Ek **beep sound** aur **browser desktop notification** aati hai (turant, same time par)
  - Notification par click karke seedha uski chat khul jaati hai
- **"Typing..." indicator** bhi hai jab doosra insaan type kar raha ho.
- Har pair ki purani chat history yaad rehti hai (jab tak server restart na ho).

## Kaise chalayein
1. Terminal mein project folder ke andar jao
2. Dependencies install karo:
   ```
   npm install
   ```
3. Server start karo:
   ```
   npm start
   ```
4. Browser mein kholo: `http://localhost:3000`
5. Testing ke liye do alag browser tabs (ya ek incognito) mein khol kar do alag naam se login karo.

## Notes
- Ye version data ko **server ki memory** mein rakhta hai (koi database nahi) — server restart hone par purani chats khatam ho jaayengi. Agar permanent storage chahiye (MongoDB jaisa), bata dena — wo bhi add kar dunga.
- Desktop notification ke liye browser permission allow karni hogi (pehli baar poochega).
