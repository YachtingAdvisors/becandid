# Windows Code Signing Guide

Step-by-step guide for signing the Be Candid Windows installer.

## 1. Purchase a Code Signing Certificate

| Type | Cost | SmartScreen behavior |
|------|------|----------------------|
| EV cert (recommended) | $200-400/yr | Warning removed immediately |
| Standard cert | $100-200/yr | Warning shown until reputation builds |

**Recommended providers:** DigiCert, Sectigo, or SSL.com.

EV certificates are strongly recommended for desktop apps distributed outside the Microsoft Store. They eliminate SmartScreen warnings from the first install.

## 2. Configure electron-builder for Signing

### Option A: In `electron-builder.yml`

```yaml
win:
  certificateFile: ./certs/windows.pfx
  certificatePassword: ${WIN_CERT_PASSWORD}
  signingHashAlgorithms: [sha256]
```

### Option B: Environment Variables (Preferred for CI)

```bash
export CSC_LINK=path/to/cert.pfx
export CSC_KEY_PASSWORD=your-password
```

electron-builder reads these automatically. No config file changes needed.

## 3. Build with Signing

```bash
CSC_LINK=./certs/windows.pfx CSC_KEY_PASSWORD=xxx npm run dist:win
```

Or, if using CI (e.g., GitHub Actions), set `CSC_LINK` and `CSC_KEY_PASSWORD` as repository secrets.

## 4. Verify the Signature

Open PowerShell on a Windows machine and run:

```powershell
Get-AuthenticodeSignature "Be Candid Setup.exe"
```

The output should show `Status: Valid` and the signer name matching your certificate.

## 5. CI/CD Integration (GitHub Actions)

```yaml
- name: Build Windows Installer
  env:
    CSC_LINK: ${{ secrets.WIN_CSC_LINK }}
    CSC_KEY_PASSWORD: ${{ secrets.WIN_CSC_KEY_PASSWORD }}
  run: npx electron-builder --win --publish never
```

Store the `.pfx` file as a base64-encoded secret and decode it in the workflow, or reference a secure file path.

## Security Notes

- Never commit `.pfx` files or passwords to the repository.
- Store certificate credentials in CI secrets or a secrets manager.
- Rotate certificates before expiry to avoid signing gaps.
