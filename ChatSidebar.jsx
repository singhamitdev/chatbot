// import React, { useState } from "react";
// import {
//   ChevronRight,
//   ChevronLeft,
//   PlusSquare,
//   Settings,
//   User,
// } from "lucide-react";
// import ChatHistory from "./ChatHistory";
// import ChatHeader from "./ChatHeader";
// import Icon from "../Common/Icon";
// import useNavigateWithBase from "../../customHooks/useNavigationWithBase";
// import UserProfileMenu from "../UserProfile/UserProfileMenu";
// import { useSelector } from "react-redux";
// import { formatRole } from "../../utility/htmlUtils";

// const ChatSidebar = ({
//   chat,
//   chatHistory,
//   handleNewChat,
//   handleEditChatHistoryClick,
//   handleDeleteChatHistoryClick,
//   handleSelectChatHistory,
//   editingChatId,
//   editingTitle,
//   handleEditChatHistoryChange,
//   showOptions,
//   setShowOptions,
//   isExpanded,
//   setIsExpanded,
// }) => {
//   //const [isExpanded, setIsExpanded] = useState(true);
//   const navigate = useNavigateWithBase();
//   const theme = useSelector((state) => state.theme.theme);
//   const userDetails = useSelector((state) => state.user.userDetails);

//   const handleSupport = () => {
//     if (userDetails?.role === "admin") {
//       navigate("/support/vault-config");
//     } else {
//       navigate("/chat");
//     }
//   };

//   return (
//     <div
//       className={`fixed left-0 top-0 h-full border-r shadow-lg transition-all duration-300 ease-in-out z-10 ${
//         isExpanded ? "w-56" : "w-16"
//       }`}
//     >
//       <button
//         onClick={() => setIsExpanded(!isExpanded)}
//         className="absolute -right-3 top-4 bg-white rounded-full border p-1 shadow-md hover:bg-gray-50 z-20"
//       >
//         {isExpanded ? (
//           <ChevronLeft className="w-4 h-4 text-gray-600" />
//         ) : (
//           <ChevronRight className="w-4 h-4 text-gray-600" />
//         )}
//       </button>
//       <div className="absolute top-0 left-0 right-0">
//         {chat?.length > 0 && <ChatHeader />}
//         <div className="px-3 mt-4 mb-2">
//           {/* new chat button */}
//           <button
//             className={`w-full rounded-lg flex items-center gap-3 p-2 bg-sky-100 hover:bg-sky-200 cursor-pointer mb-4 ${
//               isExpanded ? "justify-start" : "justify-center"
//             }`}
//             onClick={handleNewChat}
//           >
//             {/* <PlusSquare className={`w-6 h-6 text-gray-600`} /> */}
//             <Icon name="newchaticon" />
//             {isExpanded && <span className="text-gray-700">New Chat</span>}
//           </button>
//         </div>
//         <div className="flex flex-col h-[calc(100%-160px)] px-3">
//           {/* recent chats header */}
//           {isExpanded && chatHistory?.length > 0 && (
//             <div className="text-sm font-medium text-gray-500 py-2 px-3 border-b mb-2">
//               Recent Chats
//             </div>
//           )}
//         </div>
//         {/* chat history */}
//         <div className="flex-grow overflow-y-scroll overflow-visible no-scrollbar mb-4 pb-16">
//           {isExpanded ? (
//             <ChatHistory
//               chatHistory={chatHistory}
//               handleEditChatHistoryClick={handleEditChatHistoryClick}
//               handleDeleteChatHistoryClick={handleDeleteChatHistoryClick}
//               handleSelectChatHistory={handleSelectChatHistory}
//               editingChatId={editingChatId}
//               editingTitle={editingTitle}
//               handleEditChatHistoryChange={handleEditChatHistoryChange}
//               showOptions={showOptions}
//               setShowOptions={setShowOptions}
//             />
//           ) : (
//             chatHistory?.length > 0 && (
//               <div className="flex flex-col items-center space-y-2">
//                 {chatHistory.map((chatItem) => (
//                   <div
//                     key={chatItem.id}
//                     onClick={() => handleSelectChatHistory(chatItem.id)}
//                     className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200"
//                     title={chatItem.title}
//                   >
//                     <span className="text-xs font-medium text-gray-600">
//                       {chatItem?.title?.charAt(0)?.toUpperCase()}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             )
//           )}
//         </div>
//       </div>
//       <div className="absolute bottom-0 left-0 right-0 border-t px-3 py-2">
//         <div
//           className="py-2 rounded text-center text-base font-light flex items-center px-2 hover:bg-sky-100 cursor-pointer mb-2"
//           onClick={handleSupport}
//         >
//           <span className="mr-4">
//             <Icon name="settingsicon" />
//           </span>
//           {isExpanded && "Settings"}
//         </div>
//         {isExpanded ? (
//           <div className="bg-blue-500 text-white font-bold rounded-full">
//             <UserProfileMenu
//               userInfo={{
//                 name: `${userDetails?.firstName ?? ""} ${
//                   userDetails?.lastName ?? ""
//                 }`,
//                 role: formatRole(userDetails?.role),
//               }}
//             />
//           </div>
//         ) : (
//           <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
//             <User className="w-5 h-5" />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
// export default ChatSidebar;
import React from "react";
import { ChevronRight, ChevronLeft, User } from "lucide-react";
import ChatHistory from "./ChatHistory";
import ChatHeader from "./ChatHeader";
import Icon from "../Common/Icon";
import useNavigateWithBase from "../../customHooks/useNavigationWithBase";
import UserProfileMenu from "../UserProfile/UserProfileMenu";
import { useSelector } from "react-redux";
import { formatRole } from "../../utility/htmlUtils";

const ChatSidebar = ({
  chat,
  chatHistory,
  handleNewChat,
  handleEditChatHistoryClick,
  handleDeleteChatHistoryClick,
  handleSelectChatHistory,
  editingChatId,
  editingTitle,
  handleEditChatHistoryChange,
  showOptions,
  setShowOptions,
  isExpanded,
  setIsExpanded,
  activeView,
  setActiveView,
}) => {
  const navigate = useNavigateWithBase();
  const theme = useSelector((state) => state.theme.theme);
  const userDetails = useSelector((state) => state.user.userDetails);

  const handleSupport = () => {
    theme === "supportThemeL3"
      ? navigate("/support/vault-config")
      : navigate("/chat");
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full border-r shadow-lg transition-all duration-300 ease-in-out z-10 ${
        isExpanded ? "w-56" : "w-16"
      }`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-4 bg-white rounded-full border p-1 shadow-md hover:bg-gray-50 z-20"
      >
        {isExpanded ? (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        )}
      </button>

      <div className="absolute top-0 left-0 right-0">
        <ChatHeader />

        <div className="px-3 mt-4 mb-2">
          {/* IntelliOps Menu */}

          {/* Pipeline Dashboard Menu */}
          {/* <div
            className={`w-full rounded-lg flex items-center gap-3 p-2 hover:bg-sky-100 cursor-pointer mb-4 ${
              isExpanded ? "justify-start" : "justify-center"
            } ${activeView === "pipeline" ? " text-blue-600 bg-sky-200" : ""}`}
            onClick={() => setActiveView("pipeline")}
          >
            <Icon name="feedbackicon" />
            {isExpanded && (
              <span
                className={`${
                  activeView === "pipeline" ? " text-blue-600" : "text-gray-700"
                }`}
              >
                Pipeline Dashboard
              </span>
            )}
          </div> */}
          {/* <div
            className={`w-full rounded-lg flex items-center gap-3 p-2 hover:bg-sky-100 cursor-pointer mb-2 ${
              isExpanded ? "justify-start" : "justify-center"
            } ${
              activeView === "intelliops" ? " text-blue-600 bg-sky-200" : ""
            }`}
            onClick={() => setActiveView("intelliops")}
          >
            <Icon name="boticon" />
            {isExpanded && (
              <span
                className={`${
                  activeView === "intelliops"
                    ? " text-blue-600"
                    : "text-gray-700"
                }`}
              >
                IntelliAgent
              </span>
            )}
          </div> */}

          {/* New Chat Button (only for IntelliOps) */}
          {activeView === "intelliops" && (
            <button
              className={`w-full rounded-lg flex items-center gap-3 p-2 bg-sky-100 hover:bg-sky-200 cursor-pointer mb-4 ${
                isExpanded ? "justify-start" : "justify-center"
              }`}
              onClick={handleNewChat}
            >
              <Icon name="newchaticon" />
              {isExpanded && <span className="text-gray-700">New Chat</span>}
            </button>
          )}
        </div>

        {/* Recent Chats Header */}
        {activeView === "intelliops" &&
          isExpanded &&
          chatHistory?.length > 0 && (
            <div className="text-sm font-medium text-gray-500 py-2 px-3 border-b mb-2">
              Recent Chats
            </div>
          )}

        {/* Chat History */}
        <div className="flex-grow overflow-y-scroll overflow-visible no-scrollbar mb-4 pb-16">
          {activeView === "intelliops" &&
            (isExpanded ? (
              <ChatHistory
                chatHistory={chatHistory}
                handleEditChatHistoryClick={handleEditChatHistoryClick}
                handleDeleteChatHistoryClick={handleDeleteChatHistoryClick}
                handleSelectChatHistory={handleSelectChatHistory}
                editingChatId={editingChatId}
                editingTitle={editingTitle}
                handleEditChatHistoryChange={handleEditChatHistoryChange}
                showOptions={showOptions}
                setShowOptions={setShowOptions}
              />
            ) : (
              chatHistory?.length > 0 && (
                <div className="flex flex-col items-center space-y-2">
                  {chatHistory.map((chatItem) => (
                    <div
                      key={chatItem.id}
                      onClick={() => handleSelectChatHistory(chatItem.id)}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200"
                      title={chatItem.title}
                    >
                      <span className="text-xs font-medium text-gray-600">
                        {chatItem?.title?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )
            ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 border-t px-3 py-2">
        <div
          className="py-2 rounded text-center text-base font-light flex items-center px-2 hover:bg-sky-100 cursor-pointer mb-2"
          onClick={handleSupport}
        >
          <span className="mr-4">
            <Icon name="settingsicon" />
          </span>
          {isExpanded && "Settings"}
        </div>
        {isExpanded ? (
          <div className="bg-blue-500 text-white font-bold rounded-full">
            <UserProfileMenu
              userInfo={{
                name: `${userDetails?.firstName ?? ""} ${
                  userDetails?.lastName ?? ""
                }`,
                role: formatRole(userDetails?.role),
              }}
            />
          </div>
        ) : (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <User className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
