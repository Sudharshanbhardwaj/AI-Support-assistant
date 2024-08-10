'use client'
import Image from 'next/image'
import { Box, Button, Stack, TextField, Typography, CircularProgress, InputAdornment } from '@mui/material'
import { Send } from '@mui/icons-material'
import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Welcome to Headstarter! How can I help you today?",
    },
  ])
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async (msg = message) => {
    if (!msg.trim()) return;  // Don't send empty messages
    setIsLoading(true)

    setMessage("")
    setMessages((messages) => [
      ...messages,
      { role: "user", content: msg },
      { role: "assistant", content: "" },
    ])
  
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, { role: "user", content: msg }]),
      })
  
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
  
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
  
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error("Error:", error)
      setMessages((messages) => [
        ...messages,
        { role: "assistant", content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }
    setIsLoading(false)
  }

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{ p: 3, bgcolor: "#f0f4f8" }} // Softer background color
    >
      {/* Header */}
      <Box 
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
        maxWidth="500px"
        sx={{ 
          bgcolor: "#ffffff", // White background for the header
          boxShadow: 3,
          borderRadius: 2,
          p: 2,
          mb: 2,
          border: "1px solid #e0e0e0",
          color: "#333", // Darker text color for better readability
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Image src="/target.svg" alt="Target Icon" width={40} height={40} />
        </Box>
        <Typography 
          variant="h6" 
          fontWeight="bold"
          sx={{
            fontSize: "1.25rem",
            flexGrow: 1,
            textAlign: "center",
            color: "#333", // Darker text color for better readability
          }}
        >
          AI Support assistant
        </Typography>
      </Box>

      {/* Chatbot Content */}
      <Stack
        direction="column"
        width="100%"
        maxWidth="500px"
        height="calc(100vh - 200px)"
        p={2}
        spacing={2}
        sx={{
          bgcolor: "white",
          boxShadow: 3,
          borderRadius: 2,
          border: "1px solid #e0e0e0",
          overflow: "hidden",
        }}
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          sx={{ maxHeight: "100%", pb: 2 }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                display="flex"
                alignItems="center"
                bgcolor={
                  message.role === "assistant"
                    ? "#e3f2fd"
                    : "#ffcdd2"
                }
                color="black"
                borderRadius={4}
                p={2}
                maxWidth="80%"
                sx={{ wordBreak: "break-word", boxShadow: 1 }}
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>

        {/* User Input */}
        <Stack direction="row" spacing={2}>
          <TextField
            label="Type your message..."
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            InputProps={{
              endAdornment: (
                isLoading && (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                )
              ),
            }}
            sx={{
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: 1,
              borderColor: "#ddd",
            }}
          />
          <Button 
            variant="contained" 
            onClick={() => sendMessage()} 
            disabled={isLoading}
            sx={{
              bgcolor: "#1e88e5",
              "&:hover": {
                bgcolor: "#1565c0",
              },
              "&:disabled": {
                bgcolor: "#90caf9",
              },
              minWidth: 50, 
            }}
          >
            <Send /> 
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
