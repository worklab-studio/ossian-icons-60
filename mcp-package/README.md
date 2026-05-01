# iconstack-mcp

[![npm](https://img.shields.io/npm/v/iconstack-mcp.svg)](https://www.npmjs.com/package/iconstack-mcp)

**Search 51,000+ icons across 21 libraries from inside Cursor, Claude Desktop, or Windsurf — and drop the SVG straight into your code without ever opening a browser.**

Powered by [Iconstack](https://iconstack.io). No account, no API key, no config. Just `npx`.

## What you get

Three MCP tools your AI assistant can call:

| Tool | What it does |
|---|---|
| `search_icons` | Semantic+lexical search across Lucide, Phosphor, Tabler, Heroicons, Material, Simple Icons (brands), Carbon, Fluent UI, Solar, Iconsax and 11 more. |
| `get_icon_svg` | Returns the raw SVG markup for a specific icon, ready to paste. |
| `list_libraries` | Lists all 21 supported libraries with ids and styles. |

## Install

### Cursor

Add to `~/.cursor/mcp.json` (or your project's `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "iconstack": {
      "command": "npx",
      "args": ["-y", "iconstack-mcp"]
    }
  }
}
```

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "iconstack": {
      "command": "npx",
      "args": ["-y", "iconstack-mcp"]
    }
  }
}
```

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "iconstack": {
      "command": "npx",
      "args": ["-y", "iconstack-mcp"]
    }
  }
}
```

### Continue, Cline, etc.

Any MCP-compatible client works — point it at `npx -y iconstack-mcp`.

## Example prompts

Once installed, ask your assistant things like:

- *"Find me a clean outline shopping cart icon and add it to the header."*
- *"I need a GitHub logo SVG — use Simple Icons."*
- *"Replace this emoji 🚀 with a proper Lucide rocket icon."*
- *"Show me 5 different arrow-right styles across libraries."*

The assistant will call `search_icons`, then `get_icon_svg`, then paste the SVG directly into your file.

## Configuration

Optional environment variables:

| Var | Default | Purpose |
|---|---|---|
| `ICONSTACK_API_BASE` | `https://sglpxftkuzsqdpdhftwv.supabase.co/functions/v1` | Override the API base URL. |
| `ICONSTACK_ANON_KEY` | (built-in public key) | Override the public anon key. |

## Local development

```bash
git clone https://github.com/iconstack/iconstack-mcp
cd iconstack-mcp
npm install
npm run build
node dist/index.js  # speaks MCP over stdio
```

Test with the official MCP inspector:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## License

MIT — see [LICENSE](./LICENSE).

## Links

- 🌐 [iconstack.io](https://iconstack.io)
- 📚 [API docs](https://iconstack.io/api)
- 🐙 [GitHub](https://github.com/iconstack/iconstack-mcp)
