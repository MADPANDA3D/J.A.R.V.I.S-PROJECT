// Agent Response Formatter - Add this as final node after Success Summary
// This formats the workflow output for JARVIS agent consumption

const summary = $input.first().json;

return [{
  json: {
    // Standard agent response format
    success: summary.success,
    message: summary.message,
    
    // Structured data for agent decision making
    embedding_results: {
      total_documents: summary.results.totalDocuments,
      successful_embeddings: summary.results.successfulEmbeddings,
      failed_embeddings: summary.results.failedEmbeddings,
      success_rate: `${Math.round((summary.results.successfulEmbeddings / summary.results.totalDocuments) * 100)}%`,
      vector_collection: summary.results.collection
    },
    
    // Action status for JARVIS
    action_completed: summary.success,
    knowledge_base_updated: summary.success,
    
    // Human readable summary for JARVIS
    agent_summary: `Processed ${summary.results.totalDocuments} documents with ${summary.results.successfulEmbeddings} successful embeddings (${Math.round((summary.results.successfulEmbeddings / summary.results.totalDocuments) * 100)}% success rate). JARVIS knowledge base has been updated.`,
    
    // Tool metadata
    tool_name: "embed_documents",
    execution_timestamp: summary.timestamp,
    pipeline_name: summary.pipeline,
    
    // Error details if any
    errors: summary.details.filter(item => item.status === 'failed'),
    
    // Next action recommendations
    recommendations: summary.results.failedEmbeddings > 0 
      ? ["Review failed embeddings", "Check document formats", "Verify file permissions"]
      : ["Knowledge base successfully updated", "Ready for query operations"]
  }
}];