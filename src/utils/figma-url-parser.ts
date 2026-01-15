/**
 * Parse Figma URL to extract fileKey and nodeId
 *
 * Supports formats:
 * - https://www.figma.com/design/<fileKey>/...
 * - https://www.figma.com/file/<fileKey>/...
 * - With or without node-id parameter: ?node-id=<nodeId>
 * - nodeId format: 2781-11080 (will be converted to 2781:11080)
 * - Multiple nodeIds: 2781-11080;1234-5678
 */

export interface ParsedFigmaUrl {
  fileKey: string;
  nodeId?: string;
}

/**
 * Parse a Figma URL to extract fileKey and optional nodeId
 *
 * @param url - Figma design file URL
 * @returns Parsed result with fileKey and optional nodeId (with - converted to :)
 * @throws Error if URL format is invalid
 */
export function parseFigmaUrl(url: string): ParsedFigmaUrl {
  try {
    const urlObj = new URL(url);

    // Extract fileKey from pathname
    // Path format: /design/<fileKey>/... or /file/<fileKey>/...
    const pathMatch = urlObj.pathname.match(/^\/(?:design|file)\/([a-zA-Z0-9]+)/);
    if (!pathMatch) {
      throw new Error(
        `Invalid Figma URL format. Expected path like /design/<fileKey> or /file/<fileKey>, got: ${urlObj.pathname}`,
      );
    }

    const fileKey = pathMatch[1];

    // Extract nodeId from query parameters
    let nodeId: string | undefined;
    const nodeIdParam = urlObj.searchParams.get("node-id");
    if (nodeIdParam) {
      // Convert - to : for Figma API format
      // Support multiple nodeIds separated by ;
      nodeId = nodeIdParam.replace(/-/g, ":");
    }

    return {
      fileKey,
      nodeId,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to parse Figma URL: ${String(error)}`);
  }
}

