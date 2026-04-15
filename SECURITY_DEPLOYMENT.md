# Security And Deployment

Keep your SerpApi key only in `.env`:

```env
SERPAPI_KEY=your_serpapi_key_here
```

Do not commit `.env` to version control. When deploying, add the same environment variable in your hosting provider settings.
