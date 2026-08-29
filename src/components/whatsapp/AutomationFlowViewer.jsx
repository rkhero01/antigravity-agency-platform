import React from 'react';
import {
  Zap,
  Clock,
  MessageSquare,
  GitBranch,
  UserCheck,
  Tag,
  Bell,
  CheckCircle2,
  ArrowDown,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export function AutomationFlowViewer({
  flow,
}) {
  if (!flow) return null;

  const rawSteps = flow.steps || [];

  // Parse structured node representation from steps
  const parseStepNode = (step, index) => {
    if (typeof step === 'object' && step !== null) {
      return step;
    }

    const str = String(step);
    let type = 'ACTION';
    let title = str;
    let description = '';
    let config = null;

    if (str.toLowerCase().startsWith('trigger:') || index === 0) {
      type = 'TRIGGER';
      title = str.replace(/^trigger:\s*/i, '');
      description = `Trigger event configured for ${flow.clientName || 'workspace'}`;
    } else if (str.toLowerCase().includes('wait') || str.toLowerCase().includes('delay') || str.toLowerCase().includes('minute') || str.toLowerCase().includes('hour')) {
      type = 'WAIT';
      title = str.replace(/^action:\s*/i, '');
      description = 'Timed delay before next customer touchpoint';
    } else if (str.toLowerCase().includes('send') || str.toLowerCase().includes('template') || str.toLowerCase().includes('message') || str.toLowerCase().includes('whatsapp')) {
      type = 'MESSAGE';
      title = str.replace(/^action:\s*/i, '');
      description = 'Meta-approved WhatsApp message template dispatched';
    } else if (str.toLowerCase().includes('condition') || str.toLowerCase().includes('if ') || str.toLowerCase().includes('check')) {
      type = 'CONDITION';
      title = str.replace(/^condition:\s*/i, '');
      description = 'Evaluates customer engagement & reply intent';
      config = {
        yes: 'Assign to Sales Team & Trigger Priority SLA',
        no: 'Continue follow-up nurture sequence',
      };
    } else if (str.toLowerCase().includes('assign') || str.toLowerCase().includes('crm') || str.toLowerCase().includes('stage') || str.toLowerCase().includes('lead')) {
      type = 'CRM_ACTION';
      title = str.replace(/^action:\s*/i, '');
      description = 'Updates deal pipeline stage & sales representative';
    } else if (str.toLowerCase().includes('tag')) {
      type = 'TAG';
      title = str.replace(/^action:\s*/i, '');
      description = 'Attaches behavioral segment tag to contact';
    } else {
      type = 'ACTION';
      title = str.replace(/^action:\s*/i, '');
      description = 'Automated workflow execution';
    }

    return {
      stepNum: index + 1,
      type,
      title,
      description,
      config,
    };
  };

  const parsedNodes = rawSteps.map((s, idx) => parseStepNode(s, idx));

  const getNodeStyles = (type) => {
    switch (type) {
      case 'TRIGGER':
        return {
          icon: Zap,
          color: '#3b82f6',
          bg: 'rgba(59, 130, 246, 0.15)',
          border: 'rgba(59, 130, 246, 0.4)',
          label: 'TRIGGER EVENT',
        };
      case 'WAIT':
        return {
          icon: Clock,
          color: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.15)',
          border: 'rgba(245, 158, 11, 0.4)',
          label: 'TIME DELAY',
        };
      case 'MESSAGE':
        return {
          icon: MessageSquare,
          color: '#22c55e',
          bg: 'rgba(34, 197, 94, 0.15)',
          border: 'rgba(34, 197, 94, 0.4)',
          label: 'WHATSAPP MESSAGE',
        };
      case 'CONDITION':
        return {
          icon: GitBranch,
          color: '#a855f7',
          bg: 'rgba(168, 85, 247, 0.15)',
          border: 'rgba(168, 85, 247, 0.4)',
          label: 'BRANCHING CONDITION',
        };
      case 'CRM_ACTION':
        return {
          icon: UserCheck,
          color: '#06b6d4',
          bg: 'rgba(6, 182, 212, 0.15)',
          border: 'rgba(6, 182, 212, 0.4)',
          label: 'CRM PIPELINE ACTION',
        };
      case 'TAG':
        return {
          icon: Tag,
          color: '#ec4899',
          bg: 'rgba(236, 72, 153, 0.15)',
          border: 'rgba(236, 72, 153, 0.4)',
          label: 'TAG CONTACT',
        };
      default:
        return {
          icon: Sparkles,
          color: '#818cf8',
          bg: 'rgba(129, 140, 248, 0.15)',
          border: 'rgba(129, 140, 248, 0.4)',
          label: 'ACTION NODE',
        };
    }
  };

  return (
    <div className="wa-automation-flow-viewer">
      <div className="flow-nodes-vertical-stream">
        {parsedNodes.map((node, idx) => {
          const style = getNodeStyles(node.type);
          const Icon = style.icon;

          return (
            <React.Fragment key={idx}>
              <div
                className="flow-node-card"
                style={{
                  borderLeft: `4px solid ${style.color}`,
                }}
              >
                {/* Node Header */}
                <div className="node-top-bar">
                  <div className="flex items-center gap-2">
                    <span
                      className="node-type-pill"
                      style={{ background: style.bg, color: style.color, borderColor: style.border }}
                    >
                      <Icon size={11} />
                      <span>{style.label}</span>
                    </span>
                    <span className="node-step-badge">STEP {idx + 1}</span>
                  </div>
                </div>

                {/* Node Content */}
                <div className="node-content-body">
                  <h5 className="node-title">{node.title}</h5>
                  <p className="node-desc">{node.description}</p>

                  {/* Branching Logic Sub-Card if Condition */}
                  {node.type === 'CONDITION' && (
                    <div className="condition-branches-box">
                      <div className="branch-col yes">
                        <span className="branch-label text-success">✓ YES (Replied):</span>
                        <p className="branch-text">{node.config?.yes || 'Route to Sales Team & VIP Queue'}</p>
                      </div>
                      <div className="branch-col no">
                        <span className="branch-label text-warning">× NO (No Reply):</span>
                        <p className="branch-text">{node.config?.no || 'Proceed to automated follow-up'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Connecting Connector Arrow */}
              {idx < parsedNodes.length - 1 && (
                <div className="flow-connector-line">
                  <div className="vertical-dash-line" />
                  <ArrowDown size={14} className="connector-arrow-icon" />
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* End of Journey Terminal Node */}
        <div className="flow-connector-line">
          <div className="vertical-dash-line" />
          <ArrowDown size={14} className="connector-arrow-icon" />
        </div>

        <div className="flow-end-terminal-node">
          <CheckCircle2 size={15} className="text-success" />
          <span>JOURNEY COMPLETED / EXIT FLOW</span>
        </div>
      </div>
    </div>
  );
}

export default AutomationFlowViewer;
