import React, { memo } from "react";
import TypingIndicator from "../Common/TypingIndicator";
import Icon from "../Common/Icon";
import Chart from "../Responses/Chart";
import ChatPopUp from "./AgenticView/ChatPopUp";
import {
  VisibilityOff,
  Visibility,
  Download,
  InsertDriveFile,
} from "@mui/icons-material";
import useMessageRenderer from "../../customHooks/useMessageRenderer";
import { isFullHtmlDocument } from "../../utility/htmlUtils";
import HtmlDocumentViewer from "../Common/HtmlDocumentViewer";
import {
  downloadFile,
  formatFileSize,
  getFileIcon,
} from "../../utility/downloadUtils";

const MemoizedContent = memo(({ content, type, isStreaming, role }) => {
  const { convertHtmlToMarkdown } = useMessageRenderer();
  const isDocument = isFullHtmlDocument(content);

  // Helper function to handle file download
  const handleDownload = async (fileData) => {
    try {
      const success = await downloadFile(fileData);
      if (!success) {
        alert("Failed to download file. Please try again.");
      }
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download file. Please try again.");
    }
  };

  if (type === "chart") {
    return (
      <Chart
        chartType={content.chartType}
        data={content.data}
        options={content.options}
      />
    );
  } else if (type === "download") {
    // Handle download type - expecting content to be either a single file object or array of files
    const files = Array.isArray(content) ? content : [content];

    return (
      <div className="flex flex-col space-y-3">
        {files.map((fileData, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="text-2xl">{getFileIcon(fileData.name)}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {fileData.name || "Untitled File"}
                  </h4>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                    {fileData.type && (
                      <span className="uppercase">{fileData.type}</span>
                    )}
                    {fileData.size && (
                      <>
                        <span>•</span>
                        <span>{formatFileSize(fileData.size)}</span>
                      </>
                    )}
                  </div>
                  {fileData.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {fileData.description}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDownload(fileData)}
                className="ml-3 flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                title="Download file"
              >
                <Download style={{ fontSize: "16px" }} />
                <span>Download</span>
              </button>
            </div>

            {/* Progress bar for download (optional - can be used for future enhancements) */}
            {fileData.downloadProgress && (
              <div className="mt-3">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${fileData.downloadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Downloading... {fileData.downloadProgress}%
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  } else if (type === "file") {
    return (
      <div className="flex flex-col space-y-2">
        {Array.isArray(content) &&
          content.map((fileObj, idx) => {
            const isImage = fileObj.type.startsWith("image/");
            return (
              <div key={idx} className="bg-gray-100 p-2 rounded shadow-sm">
                {isImage ? (
                  <img
                    src={fileObj.url}
                    alt={fileObj.name}
                    className="max-w-xs rounded"
                  />
                ) : (
                  <a
                    href={fileObj.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    📎 {fileObj.name}
                  </a>
                )}
              </div>
            );
          })}
      </div>
    );
  } else if (isDocument) {
    return <HtmlDocumentViewer htmlContent={content} />;
  } else {
    return (
      <div
        className={role === "user" ? "whitespace-pre-wrap break-words" : ""}
        dangerouslySetInnerHTML={{
          __html: convertHtmlToMarkdown(content),
        }}
      />
    );
  }
});

const MessageBubble = memo(
  ({
    item,
    isLast,
    isStreaming,
    streamedText,
    handleAgenticView,
    activeAgenticMessage,
  }) => {
    const isAssistant = item.role === "assistant";
    const showStream =
      isAssistant &&
      isLast &&
      item.type !== "chart" &&
      item.type !== "download";
    const isDocument = isFullHtmlDocument(item.content);

    const formatTime = (timestamp) => {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return (
      <div
        className={`relative max-w-[95%] mx-auto py-2 flex items-start ${
          item.role === "user" ? "flex-row-reverse" : ""
        }`}
      >
        <div className="flex items-center space-x-1 mr-2">
          {isAssistant && (
            <div className="relative group cursor-pointer">
              {activeAgenticMessage?.message_id === item.message_id ? (
                <Visibility
                  onClick={() => handleAgenticView(item.message_id)}
                  style={{ fontSize: "16px", color: "rgb(59, 130, 246)" }}
                />
              ) : (
                <VisibilityOff
                  onClick={() => handleAgenticView(item.message_id)}
                  style={{ fontSize: "16px", color: "rgb(59, 130, 246)" }}
                />
              )}
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                View Agentic Workflow
              </div>
            </div>
          )}

          <span
            className={`p-1 rounded-full ${
              item.role === "user" ? "bg-gray-400" : "bg-sky-300"
            }`}
          >
            <Icon name={item.role === "user" ? "usericon" : "boticon"} />
          </span>
        </div>

        <div
          className="flex flex-col"
          {...(isDocument && { style: { width: "100%" } })}
          {...(item.type === "download" && { style: { width: "100%" } })}
        >
          <div
            className={`leading-tight text-sm rounded py-2 relative group flex items-start justify-between ${
              item.role === "user"
                ? "bg-gray-200 px-3"
                : "bg-sky-100 text-slate-950 px-2"
            }`}
            style={{ maxWidth: "100%" }}
          >
            {showStream && isStreaming && !isDocument ? (
              <div dangerouslySetInnerHTML={{ __html: streamedText }} />
            ) : (
              <MemoizedContent
                content={item.content}
                type={item.type}
                role={item.role}
              />
            )}
          </div>

          <div className="text-xs text-gray-500 mt-1">
            {formatTime(item.timestamp)}
          </div>
        </div>
      </div>
    );
  }
);

const ChatMessages = ({
  chat,
  isTyping,
  currentResponse,
  chatContainerRef,
  isWaitingForResponse,
  shouldAutoScroll,
  isResponseComplete,
}) => {
  const { streamedText, isStreaming, activeAgenticMessage, handleAgenticView } =
    useMessageRenderer(currentResponse, chatContainerRef, shouldAutoScroll);

  const getLastUserMessage = () =>
    [...chat].reverse().find((msg) => msg.role === "user");

  return (
    <div className="w-[95%] mx-auto transition-all duration-300 ease-in-out">
      {chat.map((item, index) => (
        <MessageBubble
          key={index}
          item={item}
          isLast={index === chat.length - 1}
          isStreaming={isStreaming}
          streamedText={streamedText}
          handleAgenticView={() => handleAgenticView(chat, item.message_id)}
          activeAgenticMessage={activeAgenticMessage}
        />
      ))}

      {isWaitingForResponse &&
        (() => {
          const userMessage = getLastUserMessage();
          return (
            <div className="w-[95%] mx-auto py-2 text-white flex items-start space-x-2 rounded">
              <div className="flex items-center space-x-1">
                <div className="relative group cursor-pointer">
                  {activeAgenticMessage?.message_id ===
                  userMessage?.message_id ? (
                    <Visibility
                      onClick={() =>
                        handleAgenticView(chat, userMessage?.message_id)
                      }
                      style={{ fontSize: "16px", color: "rgb(59, 130, 246)" }}
                    />
                  ) : (
                    <VisibilityOff
                      onClick={() =>
                        handleAgenticView(chat, userMessage?.message_id)
                      }
                      style={{ fontSize: "16px", color: "rgb(59, 130, 246)" }}
                    />
                  )}
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    View Agentic Workflow
                  </div>
                </div>
                <span className="p-1 rounded-full bg-slate-500">
                  <Icon name="boticon" />
                </span>
                <TypingIndicator />
              </div>
            </div>
          );
        })()}

      {activeAgenticMessage && (
        <ChatPopUp
          sessionId={activeAgenticMessage.chat_session_id}
          messageId={activeAgenticMessage.message_id}
          query={activeAgenticMessage.content}
          onClose={() => handleAgenticView(chat)}
          testMode={false}
        />
      )}
    </div>
  );
};

export default ChatMessages;
