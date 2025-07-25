import React, { useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";

import {
  Typography,
  Avatar,
  Box,
  IconButton,
  Card,
  CardContent,
  styled,
  Tooltip,
} from "@mui/material";
import {
  SupervisorAccount,
  Security,
  Router,
  Timeline,
  Description,
  VolumeUp,
  VolumeOff,
  PlayArrow,
  Pause,
  Close,
} from "@mui/icons-material";
import "../../../styles/global.css";
import TypingIndicator from "../../Common/TypingIndicator";
import Icon from "../../Common/Icon";
import { Rnd } from "react-rnd";
import useAudioStream from "../../../hooks/customHooks";
const defaultIcons = [
  <SupervisorAccount sx={{ fontSize: 15 }} />,
  <Security sx={{ fontSize: 15 }} />,
  <Router sx={{ fontSize: 15 }} />,
  <Timeline sx={{ fontSize: 15 }} />,
  <Description sx={{ fontSize: 15 }} />,
];
const defaultColors = ["blue", "orange", "purple", "green", "red"];
const convertAsciiTableToHtml = (asciiTable) => {
  const rows = asciiTable
    .split("\n")
    .filter((row) => row.trim() !== "" && !row.includes("----"));
  const htmlRows = rows
    .map((row) => {
      const cells = row
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell !== "");
      const htmlCells = cells
        .map((cell) => `<td class="markdown-td">${cell}</td>`)
        .join("");
      return `<tr>${htmlCells}</tr>`;
    })
    .join("");
  return `<table class="markdown-table">${htmlRows}</table>`;
};
const convertHtmlToMarkdown = (html) => {
  return html
    .replace(
      /<table/g,
      `<div class="table-scroll-wrapper"><table class="markdown-table"`
    )
    .replace(/<\/table>/g, "</table></div>")
    .replace(/<th/g, `<th class="markdown-th"`)
    .replace(/<td/g, `<td class="markdown-td"`)
    .replace(/<b>/g, `<b class="markdown-bold">`)
    .replace(/<ul>/g, `<ul class="markdown-ul">`)
    .replace(/<ol>/g, `<ol class="markdown-ol">`)
    .replace(/<li>/g, `<li class="markdown-li">`)
    .replace(/\*\*(.*?)\*\*/g, `<b>$1</b>`);
};
const ChatPopup = ({ sessionId, messageId, query, onClose }) => {
  const [chat, setChat] = useState([]);
  const [agentDetails, setAgentDetails] = useState({});
  const [messageQueue, setMessageQueue] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [highlightedAgents, setHighlightedAgents] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [lastAgent, setLastAgent] = useState(null);
  const animationFrameRef = useRef(null);
  const processedMessagesRef = useRef(new Set());
  const chatEndRef = useRef(null);
  const { lastMessage, getWebSocket } = useWebSocket(
    `ws:///stream?session_id=${sessionId}&message_id=${messageId}`,
    {
      shouldReconnect: () => true,
      retryOnError: true,
    }
  );
const {
  isAudioEnabled,
  isWaitingForAudio,
  hasAudioEnded,
  isPlaying,
  playAudio,
  pauseAudio,
  toggleAudio,
  stopAudioStream,
} = useAudioStream({ sessionId, messageId });

  useEffect(() => {
    if (!lastMessage?.data) return;
    try {
      const messageData = JSON.parse(lastMessage.data);
      if (!messageData.data_available || !Array.isArray(messageData.data))
        return;
      setIsTyping(true);
      const newMessages = messageData.data.filter((msg) => {
        const key = `${msg.message_id}-${msg.agent}`;
        if (processedMessagesRef.current.has(key)) return false;
        processedMessagesRef.current.add(key);
        return true;
      });
      if (newMessages.length > 0) {
        setMessageQueue((prev) => [...prev, ...newMessages]);
      }
    } catch (err) {
      console.error("Streaming error:", err);
    }
  }, [lastMessage]);
  useEffect(() => {
    if (isStreaming || messageQueue.length === 0) return;
    const msg = messageQueue[0];
    const { message_id, response, agent, timestamp, action_status } = msg;
    let chunkIndex = 0;
    setIsStreaming(true);
    setLastAgent(agent);
    if (!agentDetails[agent]) {
      const hash = agent
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const index = hash % defaultIcons.length;
      setAgentDetails((prev) => ({
        ...prev,
        [agent]: {
          icon: defaultIcons[index],
          color: defaultColors[index],
        },
      }));
      setHighlightedAgents((prev) => new Set(prev).add(agent));
      setTimeout(() => {
        setHighlightedAgents((prev) => {
          const updated = new Set(prev);
          updated.delete(agent);
          return updated;
        });
      }, 2000);
    }
    const processChunk = () => {
      if (chunkIndex >= response.length) {
        finalizeMessage();
        return;
      }
      const chunk = response.slice(chunkIndex, chunkIndex + 2);
      chunkIndex += 2;
      setChat((prevChat) => {
        const existingIndex = prevChat.findIndex(
          (m) => m.message_id === message_id && m.agent === agent
        );
        if (existingIndex === -1) {
          return [
            ...prevChat,
            {
              message_id,
              response: chunk,
              agent,
              timestamp,
              action_status,
              isStreaming: true,
            },
          ];
        }
        return prevChat.map((m) =>
          m.message_id === message_id && m.agent === agent
            ? { ...m, response: m.response + chunk }
            : m
        );
      });
      animationFrameRef.current = requestAnimationFrame(processChunk);
    };
    const finalizeMessage = () => {
      cancelAnimationFrame(animationFrameRef.current);
      setChat((prevChat) =>
        prevChat.map((m) =>
          m.message_id === message_id && m.agent === agent
            ? { ...m, isStreaming: false }
            : m
        )
      );
      setMessageQueue((prev) => prev.slice(1));
      setIsStreaming(false);
    };
    processChunk();
    setIsTyping(false);
    setLastAgent(agent);
  }, [messageQueue, isStreaming]);
const handleClose = () => {
  const socket = getWebSocket();
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
  }
  stopAudioStream(); // Stop audio and disconnect WebSocket
  onClose();
};
  const CustomCardContent = styled(CardContent)({
    padding: "5px 10px",
    "&:last-child": {
      paddingBottom: "5px",
    },
  });
  const renderContent = (content) => {
    if (content.includes("|")) {
      const [initialMessage, tableContent] = content.split("\n\n");
      const htmlTable = convertAsciiTableToHtml(tableContent);
      const markdownContent = convertHtmlToMarkdown(htmlTable);
      return (
        <>
          <p>{initialMessage}</p>
          <div
            className="table-scroll-wrapper"
            dangerouslySetInnerHTML={{ __html: markdownContent }}
          />
        </>
      );
    } else if (content.includes("<table")) {
      const markdownContent = convertHtmlToMarkdown(content);
      return <div dangerouslySetInnerHTML={{ __html: markdownContent }} />;
    } else {
      const markdownContent = convertHtmlToMarkdown(content);
      return <div dangerouslySetInnerHTML={{ __html: markdownContent }} />;
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <Rnd
        default={{
          x: 100,
          y: 100,
          width: 800,
          height: 400,
        }}
        minWidth={400}
        minHeight={300}
        bounds="window"
        dragHandleClassName="chat-popup-header"
        style={{ zIndex: 10000 }}
        enableResizing={{
          top: true,
          right: true,
          bottom: true,
          left: true,
          topRight: true,
          bottomRight: true,
          bottomLeft: true,
          topLeft: true,
        }}
      >
        <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-lg shadow-lg flex flex-col cursor-move">
          {/* Header */}
          <div className="chat-popup-header flex justify-between items-center px-4 bg-blue-500 text-white rounded-t-lg">
            <Typography variant="subtitle1" fontWeight="bold">
              Multi Agent Communication
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              {/* Voice Playback Button Group */}
              {isAudioEnabled && !hasAudioEnded && isWaitingForAudio ? (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  px={1}
                  py={0.25}
                  border="1px solid rgba(255, 255, 255, 0.3)"
                  borderRadius="6px"
                  boxShadow="0 1px 4px rgba(0,0,0,0.15)"
                  sx={{
                    width: "100px",
                    height: "32px",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <div className="loader" />
                </Box>
              ) : (
                <Tooltip
                  title={
                    isAudioEnabled
                      ? "Disable Voice Playback"
                      : "Enable Voice Playback"
                  }
                  arrow
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    px={1}
                    py={0.25}
                    border="1px solid rgba(255, 255, 255, 0.3)"
                    borderRadius="6px"
                    boxShadow="0 1px 4px rgba(0,0,0,0.15)"
                    sx={{
                      transition: "transform 0.15s ease, box-shadow 0.15s ease",
                      "&:hover": {
                        transform: "translateY(-1px)",
                        boxShadow: "0 3px 8px rgba(0,0,0,0.25)",
                        backgroundColor: "rgba(255,255,255,0.1)",
                      },
                      cursor: "pointer",
                      minWidth: "100px",
                      justifyContent: "center",
                    }}
                    onClick={toggleAudio}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "white", mr: 0.5, fontSize: "0.75rem" }}
                    >
                      Voice Playback
                    </Typography>
                    <IconButton size="small" sx={{ color: "white", p: 0.5 }}>
                      {isAudioEnabled ? (
                        <VolumeUp fontSize="small" />
                      ) : (
                        <VolumeOff fontSize="small" />
                      )}
                    </IconButton>
                  </Box>
                </Tooltip>
              )}
              {/* Close Button */}
              <Tooltip title="Close Chat" arrow>
                <Box
                  display="flex"
                  alignItems="center"
                  px={1}
                  py={0.25}
                  border="1px solid rgba(255, 255, 255, 0.3)"
                  borderRadius="6px"
                  boxShadow="0 1px 4px rgba(0,0,0,0.15)"
                  sx={{
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: "0 3px 8px rgba(0,0,0,0.25)",
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                    cursor: "pointer",
                  }}
                  onClick={handleClose}
                >
                  <IconButton size="small" sx={{ color: "white", p: 0.5 }}>
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              </Tooltip>
            </Box>
          </div>
          {/* Scrollable Content */}
          <div className="overflow-y-auto space-y-2 flex-1">
            {chat.map((msg) => (
              <Card
                key={`${msg.message_id}-${msg.agent}`}
                sx={{ backgroundColor: "#f9f9f9" }}
              >
                <CustomCardContent>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ marginRight: 2, width: 24, height: 24 }}>
                        {agentDetails[msg.agent]?.icon}
                      </Avatar>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: agentDetails[msg.agent]?.color,
                          backgroundColor: highlightedAgents.has(msg.agent)
                            ? "#e0f7fa"
                            : "transparent",
                          borderRadius: "4px",
                          padding: "0 4px",
                          transition: "background-color 0.5s ease",
                        }}
                      >
                        {msg.agent}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ marginLeft: 2 }}
                      >
                        Status: {msg.action_status}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {msg.timestamp}
                    </Typography>
                  </Box>
                  <Box mt={1}>{renderContent(msg.response)}</Box>
                </CustomCardContent>
              </Card>
            ))}
            {isTyping && lastAgent !== "Publisher" && (
              <div className="flex">
                <span className="ml-[10px] mr-[5px] rounded-full bg-slate-400 text-white">
                  <Icon name="boticon" />
                </span>
                <TypingIndicator />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      </Rnd>
    </div>
  );
};
export default ChatPopup;
