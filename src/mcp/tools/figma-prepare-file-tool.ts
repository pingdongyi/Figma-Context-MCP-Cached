import { z } from "zod";
import { FigmaService } from "~/services/figma.js";
import { parseFigmaUrl } from "~/utils/figma-url-parser.js";
import { Logger } from "~/utils/logger.js";

const parameters = {
  figmaUrl: z
    .string()
    .url()
    .describe(
      "The Figma design file URL, e.g., https://www.figma.com/file/{FILE_KEY}/filename or https://www.figma.com/file/{FILE_KEY}/filename?node-id={NODE_ID}",
    ),
};

const parametersSchema = z.object(parameters);
export type FigmaPrepareFileParams = z.infer<typeof parametersSchema>;

async function figmaPrepareFile(
  params: FigmaPrepareFileParams,
  figmaService: FigmaService,
) {
  try {
    const { figmaUrl } = parametersSchema.parse(params);

    Logger.log(`Parsing Figma URL: ${figmaUrl}`);

    // Parse URL to extract fileKey and nodeId
    const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);

    Logger.log(`Extracted fileKey: ${fileKey}, nodeId: ${nodeId ?? "none"}`);

    // Prepare file - this will check both file cache and nodeId if provided
    // and return detailed result information
    const result = await figmaService.prepareFile(fileKey, nodeId);

    // Use the detailed result from prepareFile to generate response message
    let resultMessage: string;

    if (result.action === "cache-disabled") {
      resultMessage = `⚠️ Cache is not enabled. Please configure --figma-caching or FIGMA_CACHING environment variable to use caching. The file will be fetched directly from API when needed.`;
    } else if (result.message) {
      // Use the detailed message from prepareFile
      resultMessage = result.message;
    } else {
      // Fallback message generation (should not happen, but just in case)
      if (nodeId) {
        if (result.wasCached && result.nodeExists) {
          resultMessage = `Cache exists for file ${fileKey} and node ${nodeId} is present. No data fetched.`;
        } else if (result.wasCached && result.nodeExists === false) {
          resultMessage = `Cache exists for file ${fileKey} but node ${nodeId} was not found. ${result.action === "refreshed" ? "Refreshed cache." : ""}`;
        } else {
          resultMessage = `Successfully prepared and cached file ${fileKey} (nodeId: ${nodeId}). The file is now ready for use.`;
        }
      } else {
        if (result.wasCached) {
          resultMessage = `Cache already exists for file ${fileKey}. No data fetched.`;
        } else {
          resultMessage = `Successfully prepared and cached file ${fileKey}. The file is now ready for use.`;
        }
      }
    }

    return {
      content: [
        {
          type: "text" as const,
          text: resultMessage,
        },
      ],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    Logger.error(`Error preparing Figma file:`, message);
    return {
      isError: true,
      content: [{ type: "text" as const, text: `Error preparing file: ${message}` }],
    };
  }
}

// Export tool configuration
export const figmaPrepareFileTool = {
  name: "figma_prepare_file",
  description:
    "IMPORTANT: When a user provides a Figma URL, you MUST call this tool FIRST before calling get_figma_data. This tool prepares the Figma file by checking if it's cached and fetching it if needed. Even if caching is not enabled, you should still call this tool first (it will return a warning but continue normally). This ensures the file is ready before data extraction.",
  parameters,
  handler: figmaPrepareFile,
} as const;

