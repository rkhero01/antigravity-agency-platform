import React, { useState, useEffect } from 'react';
import {
  AIStudioHeader,
  AIToolSelector,
  AIPromptWorkspace,
  AIResultCard,
  AIPresetTemplates,
  AIHistoryDrawer,
} from '../../components/ai/index.js';
import { PostComposerModal } from '../../components/content/PostComposerModal.jsx';
import { aiService } from '../../services/aiService.js';
import { contentService } from '../../services/contentService.js';
import { mockClients } from '../../data/mockClients.js';
import { AI_TOOLS, PRESET_TEMPLATES } from '../../data/mockAI.js';
import { CheckCircle2 } from 'lucide-react';

export function AIAssistantPage({ activeClient = 'all', onNavigate }) {
  // State: Parameters
  const [selectedModel, setSelectedModel] = useState('pulse-omni-4.5');
  const [activeToolId, setActiveToolId] = useState('captions');
  const [selectedClientId, setSelectedClientId] = useState(
    activeClient && activeClient !== 'all' ? activeClient : 'c1'
  );
  const [selectedTone, setSelectedTone] = useState('bold');
  const [selectedObjective, setSelectedObjective] = useState('engagement');
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [creativityLevel, setCreativityLevel] = useState(0.7);
  const [promptText, setPromptText] = useState(
    'Promote our new seasonal launch highlighting sustainable benefits and organic ingredients.'
  );
  const [variationsCount, setVariationsCount] = useState(3);

  // State: Results & Generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVariations, setGeneratedVariations] = useState([]);
  const [historyList, setHistoryList] = useState([]);

  // Modals & Drawers
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerPrefill, setComposerPrefill] = useState({
    title: '',
    caption: '',
    hashtags: '',
    client: 'c1',
  });

  // Notification Toast
  const [toastMessage, setToastMessage] = useState(null);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Sync client when activeClient changes from global header
  useEffect(() => {
    if (activeClient && activeClient !== 'all') {
      setSelectedClientId(activeClient);
    }
  }, [activeClient]);

  // Update prompt placeholder when switching tools if user hasn't typed custom
  const handleSelectTool = (toolId) => {
    setActiveToolId(toolId);
    const tool = AI_TOOLS.find((t) => t.id === toolId);
    if (tool && tool.defaultPrompt) {
      setPromptText(tool.defaultPrompt);
    }
  };

  const loadHistory = async () => {
    const list = await aiService.getHistory();
    setHistoryList(list);
    if (list.length > 0 && generatedVariations.length === 0) {
      setGeneratedVariations(list[0].variations || []);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Main Generation Handler
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await aiService.generateContent({
        toolId: activeToolId,
        clientId: selectedClientId,
        tone: selectedTone,
        prompt: promptText,
        platform: selectedPlatform,
        objective: selectedObjective,
        creativity: creativityLevel,
        model: selectedModel,
        variationsCount,
      });

      if (response && response.variations) {
        setGeneratedVariations(response.variations);
        loadHistory();
        showToast('✨ Generated 3 on-brand copy variations successfully!');
      }
    } catch (err) {
      console.error('AI Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Quick Refine Handler
  const handleQuickRefine = async (refinementInstruction) => {
    setIsGenerating(true);
    try {
      const response = await aiService.generateContent({
        toolId: activeToolId,
        clientId: selectedClientId,
        tone: selectedTone,
        prompt: `${promptText} (Refinement: ${refinementInstruction})`,
        platform: selectedPlatform,
        objective: selectedObjective,
        creativity: creativityLevel,
        model: selectedModel,
        variationsCount: 2,
      });

      if (response && response.variations) {
        setGeneratedVariations(response.variations);
        loadHistory();
        showToast(`✨ Refined copy: "${refinementInstruction}"`);
      }
    } catch (err) {
      console.error('AI Refinement error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Restore past history item into active workspace
  const handleRestoreHistoryItem = (item) => {
    setActiveToolId(item.toolId || 'captions');
    setSelectedClientId(item.clientId || 'c1');
    setSelectedTone(item.tone || 'bold');
    setPromptText(item.prompt || '');
    if (item.variations) {
      setGeneratedVariations(item.variations);
    }
    showToast(`Loaded "${item.toolName}" generation from history`);
  };

  const handleDeleteHistoryItem = async (id) => {
    await aiService.deleteHistory(id);
    loadHistory();
    showToast('Deleted item from history');
  };

  const handleClearAllHistory = async () => {
    await aiService.clearHistory();
    setHistoryList([]);
    showToast('Cleared all generation history');
  };

  // Select a preset template
  const handleSelectTemplate = (template) => {
    setActiveToolId(template.toolId);
    setPromptText(template.prompt);
    showToast(`Loaded template: "${template.title}"`);
  };

  // Reset workspace
  const handleResetWorkspace = () => {
    const currentTool = AI_TOOLS.find((t) => t.id === activeToolId) || AI_TOOLS[0];
    setPromptText(currentTool.defaultPrompt || '');
    setGeneratedVariations([]);
    showToast('Workspace reset to defaults');
  };

  // Open in Content Calendar / Post Composer
  const handleUseInContentCalendar = (postData) => {
    setComposerPrefill({
      title: postData.title || 'AI Generated Campaign Post',
      caption: postData.caption || '',
      hashtags: postData.hashtags ? postData.hashtags.join(' ') : '#Marketing #PulseAI',
      client: selectedClientId,
    });
    setIsComposerOpen(true);
  };

  const handleCreatePostFromComposer = async (newPostData) => {
    await contentService.createPost(newPostData);
    showToast('🎉 Post created & scheduled in Content Hub!');
    setIsComposerOpen(false);
  };

  const activeClientObj = mockClients.find((c) => c.id === selectedClientId) || mockClients[0];

  return (
    <div className="ai-studio-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ai-toast-notification">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <AIStudioHeader
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        activeClientObj={activeClientObj}
        onOpenHistory={() => setIsHistoryDrawerOpen(true)}
        onOpenTemplates={() => setIsTemplatesModalOpen(true)}
        onResetWorkspace={handleResetWorkspace}
        historyCount={historyList.length}
      />

      {/* AI Tool Tabs */}
      <AIToolSelector
        activeToolId={activeToolId}
        onSelectTool={handleSelectTool}
      />

      {/* Two Column Layout: Workspace (Left) & Results (Right) */}
      <div className="ai-studio-two-columns">
        {/* Left Column: Parameter Form */}
        <div className="ai-studio-column left-column">
          <AIPromptWorkspace
            activeToolId={activeToolId}
            selectedClientId={selectedClientId}
            onClientChange={setSelectedClientId}
            selectedTone={selectedTone}
            onToneChange={setSelectedTone}
            selectedObjective={selectedObjective}
            onObjectiveChange={setSelectedObjective}
            selectedPlatform={selectedPlatform}
            onPlatformChange={setSelectedPlatform}
            creativityLevel={creativityLevel}
            onCreativityChange={setCreativityLevel}
            promptText={promptText}
            onPromptChange={setPromptText}
            onClearPrompt={() => setPromptText('')}
            onApplyPromptStarter={(starter) =>
              setPromptText((prev) => (prev ? `${prev}\n• Focus: ${starter}` : starter))
            }
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            variationsCount={variationsCount}
            onVariationsCountChange={setVariationsCount}
          />
        </div>

        {/* Right Column: Dynamic Results & Variations */}
        <div className="ai-studio-column right-column">
          <AIResultCard
            variations={generatedVariations}
            isGenerating={isGenerating}
            activeToolId={activeToolId}
            selectedClientObj={activeClientObj}
            onUseInContentCalendar={handleUseInContentCalendar}
            onQuickRefine={handleQuickRefine}
          />
        </div>
      </div>

      {/* Template Recipes Modal */}
      <AIPresetTemplates
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* History Slide-Over Drawer */}
      <AIHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        history={historyList}
        onRestoreItem={handleRestoreHistoryItem}
        onDeleteItem={handleDeleteHistoryItem}
        onClearAll={handleClearAllHistory}
      />

      {/* Integrated Post Composer Modal */}
      {isComposerOpen && (
        <PostComposerModal
          isOpen={isComposerOpen}
          onClose={() => setIsComposerOpen(false)}
          initialDate="2026-08-28"
          initialClient={composerPrefill.client}
          initialTitle={composerPrefill.title}
          initialCaption={composerPrefill.caption}
          initialHashtags={composerPrefill.hashtags}
          onCreatePost={handleCreatePostFromComposer}
        />
      )}
    </div>
  );
}

export default AIAssistantPage;
