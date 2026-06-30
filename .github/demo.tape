# VHS Demo — steganography-mcp
Output .github/demo.gif

Set Shell "bash"
Set FontSize 14
Set Width 1000
Set Height 600
Set Theme "Catppuccin Mocha"
Set Padding 20
Set TypingSpeed 30ms

# Show help
Type `npx -y steganography-mcp --help`
Sleep 300ms
Enter
Sleep 6s

# List all 128 tools
Type `npx -y steganography-mcp --list`
Sleep 300ms
Enter
Sleep 6s

# Run LSB detection on an image
Type `npx -y steganography-mcp --tool img_lsb_detect '{"file_path":"sample.png"}'`
Sleep 300ms
Enter
Sleep 6s

# Detect zero-width characters in text
Type `npx -y steganography-mcp --tool text_zwc_detect '{"text":"Hello\u200bWorld"}'`
Sleep 300ms
Enter
Sleep 6s

Sleep 2s
