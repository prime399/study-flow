"use client"

import PageTitle from "@/components/page-title"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { TrashIcon } from "lucide-react"

import { useChat } from "./_hooks/use-chat"
import { PredefinedMessages } from "./_components/predefined-messages"
import { MessageList } from "./_components/message-list"
import { ChatInput } from "./_components/chat-input"

export default function AIHelperPage() {
  const getStudyStats = useQuery(api.study.getFullStats)
  const listMyGroups = useQuery(api.groups.listMyGroups)
  const user = useQuery(api.users.viewer)

  const {
    messages,
    input,
    setInput,
    isLoading,
    error,
    messagesEndRef,
    handleSubmit,
    append,
    stop,
    reload,
    clearChat,
    clearError,
  } = useChat({
    studyStats: getStudyStats,
    groupInfo: listMyGroups,
    userName: user?.name,
  })

  return (
    <div className="">
      <div className="flex items-center justify-between">
        <PageTitle title="AI Study Assistant" />
        <Button
          variant="outline"
          size="sm"
          onClick={clearChat}
          className="gap-2"
        >
          <TrashIcon className="h-4 w-4" />
          Clear Chat
        </Button>
      </div>
      <Card className="flex h-[calc(100svh-120px)] flex-col">
        <ScrollArea
          className="flex-1 p-4"
          style={{ height: "calc(100% - 80px)" }}
        >
          {messages.length === 0 ? (
            <PredefinedMessages 
              onMessageSelect={(message) => append({ role: "user", content: message })}
              isLoading={isLoading}
            />
          ) : (
            <>
              <MessageList
                messages={messages}
                user={user}
                error={error}
                isLoading={isLoading}
                onRetry={reload}
                onClearError={clearError}
              />
              <div ref={messagesEndRef} />
            </>
          )}
        </ScrollArea>
        <ChatInput
          input={input}
          setInput={setInput}
          onSubmit={handleSubmit}
          onStop={stop}
          onReload={reload}
          isLoading={isLoading}
          error={error}
          hasMessages={messages.length > 0}
        />
      </Card>
    </div>
  )
}
