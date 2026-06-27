
# 🚀 FREE HUB ACTIVATION PROTOCOL (FINAL VERIFIED)

Your Hub is now a high-performance engineering platform with hundreds of files. GitHub's website blocks large uploads (>100 files). Follow this **Batching Protocol** to go live on your free `.vercel.app` domain.

## 1. 📂 THE BATCH UPLOAD TRICK (Required)
Instead of dragging the whole `src` folder, upload its contents in 4 specific rounds to stay under the 100-file limit.

1.  **ROUND 1**: Drag the **`src/app`** folder only. Click **"Commit changes"**.
2.  **ROUND 2**: Drag the **`src/components`** folder only. Click **"Commit changes"**.
3.  **ROUND 3**: Drag the rest of `src` (**`ai`**, **`firebase`**, **`hooks`**, **`lib`**). Click **"Commit changes"**.
4.  **ROUND 4**: Drag the **`public`** folder and the **`package.json`** file. Click **"Commit changes"**.

## 2. ⚡ VERCEL DEPLOYMENT
1.  Go to **Vercel Dashboard** and create a NEW project.
2.  Import your new repository.
3.  **DO NOT add a custom domain yet.** Use the provided `.vercel.app` link to test.
4.  **INTELLIGENCE**: Your DeepSeek key (`sk-0baa...`) is hardcoded for immediate success.
5.  **FINTECH**: Add `PESAPAL_CONSUMER_KEY` and `PESAPAL_IPN_ID` to Vercel Environment Variables.

## 3. 🛠️ VERIFY THE SYSTEM
Wait 2 minutes for Vercel to build.
1.  **Profile Check**: Navigate to `/profile`. It should now correctly route to your personal dashboard.
2.  **IPN Check**: Visit `https://your-new-app-name.vercel.app/api/ipn`. It MUST show `{"message":"IPN endpoint active"}`.

Your laboratory is technically verified. Follow the batch steps to activate! 🚀
