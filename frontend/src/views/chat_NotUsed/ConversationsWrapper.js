import React from "react"
import Conversations from "./Conversations"
import ErrorBoundary from "../../components/ErrorBoundary"

const ConversationsWrapper = () => (
  <ErrorBoundary>
    <Conversations />
  </ErrorBoundary>
)

export default ConversationsWrapper
