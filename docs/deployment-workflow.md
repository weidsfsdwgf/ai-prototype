# Deployment Workflow

## GitHub Repository

- Repository: https://github.com/weidsfsdwgf/ai-prototype
- Remote: https://github.com/weidsfsdwgf/ai-prototype.git
- Main branch: `main`

## Vercel

This project is connected to Vercel. Every push to GitHub triggers a new Vercel deployment and updates the preview site.

## Standard Update Flow

When publishing the latest prototype update:

```powershell
git status
npm run build
git add .
git commit -m "update prototype"
git push
```

Use a more specific commit message when possible, for example:

```text
update LAS prototype
adjust approval management pages
add asset management prototype
```

## Notes for Codex

When the user asks to publish the latest prototype update, treat this file as the standard workflow:

1. Verify the working tree and remote target.
2. Run the production build before publishing.
3. Commit the relevant changes with a concise message.
4. Push to `origin/main` so Vercel deploys the update.

## GitHub Push Troubleshooting

If normal network checks pass but Git still cannot push to GitHub, inspect Git's TLS backend before assuming the internet connection is down.

Known local issue:

```text
schannel: AcquireCredentialsHandle failed: SEC_E_NO_CREDENTIALS (0x8009030E)
```

This can happen when Git for Windows uses the Windows `schannel` TLS backend. In this project, use OpenSSL for GitHub operations:

```powershell
git -c http.sslBackend=openssl ls-remote origin refs/heads/main
git -c http.sslBackend=openssl push
```

If that works, persist it for this repository:

```powershell
git config --local http.sslBackend openssl
```
