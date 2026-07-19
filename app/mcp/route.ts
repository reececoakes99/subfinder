import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const quote = (value: string) => `'${value.replace(/'/g, `'\\''`)}'`;

const handler = createMcpHandler(
  async (server) => {
    server.tool(
      "do-subfinder",
      "Build a ProjectDiscovery Subfinder command for passive subdomain enumeration. Vercel cannot execute CLI binaries, so this returns a safe command to run locally where Subfinder is installed.",
      {
        domains: z.array(z.string()).min(1).describe("Domains to find subdomains for, for example example.com."),
        sources: z.array(z.string()).optional().describe("Specific passive sources to use, such as crtsh or github."),
        excludeSources: z.array(z.string()).optional().describe("Passive sources to exclude."),
        recursive: z.boolean().optional().describe("Use only sources that support recursive subdomain enumeration."),
        allSources: z.boolean().optional().describe("Use all sources; this can be slow."),
        match: z.array(z.string()).optional().describe("Subdomain patterns to include."),
        filter: z.array(z.string()).optional().describe("Subdomain patterns to exclude."),
        rateLimit: z.number().int().positive().optional().describe("Global maximum HTTP requests per second."),
        threads: z.number().int().positive().optional().describe("Concurrent resolver goroutines used with active mode."),
        resolvers: z.array(z.string()).optional().describe("DNS resolvers to use."),
        active: z.boolean().optional().describe("Return active subdomains only."),
        excludeIp: z.boolean().optional().describe("Exclude IP addresses from results."),
        json: z.boolean().optional().describe("Request JSON Lines output."),
        collectSources: z.boolean().optional().describe("Include all contributing sources in JSON output."),
        includeIp: z.boolean().optional().describe("Include host IP in active-mode output."),
        silent: z.boolean().optional().describe("Show only discovered subdomains."),
        timeout: z.number().int().positive().optional().describe("Seconds to wait for sources before timing out."),
        maxTime: z.number().int().positive().optional().describe("Maximum enumeration time in minutes."),
        proxy: z.string().optional().describe("HTTP proxy URL to use."),
      },
      async ({ domains, sources, excludeSources, recursive, allSources, match, filter, rateLimit, threads, resolvers, active, excludeIp, json, collectSources, includeIp, silent, timeout, maxTime, proxy }) => {
        const args: string[] = ["subfinder", "-d", domains.map(quote).join(",")];
        if (sources?.length) args.push("-s", quote(sources.join(",")));
        if (excludeSources?.length) args.push("-es", quote(excludeSources.join(",")));
        if (recursive) args.push("-recursive");
        if (allSources) args.push("-all");
        if (match?.length) args.push("-m", quote(match.join(",")));
        if (filter?.length) args.push("-f", quote(filter.join(",")));
        if (rateLimit) args.push("-rl", String(rateLimit));
        if (threads) args.push("-t", String(threads));
        if (resolvers?.length) args.push("-r", quote(resolvers.join(",")));
        if (active) args.push("-active");
        if (excludeIp) args.push("-ei");
        if (json) args.push("-json");
        if (collectSources) args.push("-cs");
        if (includeIp) args.push("-ip");
        if (silent) args.push("-silent");
        if (timeout) args.push("-timeout", String(timeout));
        if (maxTime) args.push("-max-time", String(maxTime));
        if (proxy) args.push("-proxy", quote(proxy));
        const command = args.join(" ");
        return {
          content: [{
            type: "text",
            text: `Run this command locally where ProjectDiscovery Subfinder is installed:\n\n${command}\n\nSubfinder is a CLI binary and cannot execute inside this Vercel serverless MCP deployment. Only scan domains you are authorized to assess.`,
          }],
        };
      }
    );
  },
  {
    capabilities: {
      tools: {
        "do-subfinder": {
          description: "Build a ProjectDiscovery Subfinder passive subdomain-enumeration command.",
        },
      },
    },
  },
  {
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
    disableSse: true,
  }
);

export { handler as GET, handler as POST, handler as DELETE };
