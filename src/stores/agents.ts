import { create } from 'zustand';
import { invokeIpc } from '@/lib/api-client';
import type { ChannelType } from '@/types/channel';
import type { AgentSummary, AgentsSnapshot } from '@/types/agent';

interface AgentsState {
  agents: AgentSummary[];
  defaultAgentId: string;
  configuredChannelTypes: string[];
  channelOwners: Record<string, string>;
  loading: boolean;
  error: string | null;
  fetchAgents: () => Promise<void>;
  createAgent: (name: string) => Promise<void>;
  updateAgent: (agentId: string, name: string) => Promise<void>;
  deleteAgent: (agentId: string) => Promise<void>;
  assignChannel: (agentId: string, channelType: ChannelType) => Promise<void>;
  removeChannel: (agentId: string, channelType: ChannelType) => Promise<void>;
  clearError: () => void;
}

function applySnapshot(snapshot: AgentsSnapshot | undefined) {
  return snapshot ? {
    agents: snapshot.agents,
    defaultAgentId: snapshot.defaultAgentId,
    configuredChannelTypes: snapshot.configuredChannelTypes,
    channelOwners: snapshot.channelOwners,
  } : {};
}

export const useAgentsStore = create<AgentsState>((set) => ({
  agents: [],
  defaultAgentId: 'main',
  configuredChannelTypes: [],
  channelOwners: {},
  loading: false,
  error: null,

  fetchAgents: async () => {
    set({ loading: true, error: null });
    try {
      const snapshot = await invokeIpc<AgentsSnapshot>('agents:list');
      set({
        ...applySnapshot(snapshot),
        loading: false,
      });
    } catch (error) {
      set({ loading: false, error: String(error) });
    }
  },

  createAgent: async (name: string) => {
    set({ error: null });
    try {
      const snapshot = await invokeIpc<AgentsSnapshot>('agents:create', name);
      set(applySnapshot(snapshot));
    } catch (error) {
      set({ error: String(error) });
      throw error;
    }
  },

  updateAgent: async (agentId: string, name: string) => {
    set({ error: null });
    try {
      const snapshot = await invokeIpc<AgentsSnapshot>('agents:update', agentId, name);
      set(applySnapshot(snapshot));
    } catch (error) {
      set({ error: String(error) });
      throw error;
    }
  },

  deleteAgent: async (agentId: string) => {
    set({ error: null });
    try {
      const snapshot = await invokeIpc<AgentsSnapshot>('agents:delete', agentId);
      set(applySnapshot(snapshot));
    } catch (error) {
      set({ error: String(error) });
      throw error;
    }
  },

  assignChannel: async (agentId: string, channelType: ChannelType) => {
    set({ error: null });
    try {
      const snapshot = await invokeIpc<AgentsSnapshot>('agents:assignChannel', agentId, channelType);
      set(applySnapshot(snapshot));
    } catch (error) {
      set({ error: String(error) });
      throw error;
    }
  },

  removeChannel: async (agentId: string, channelType: ChannelType) => {
    set({ error: null });
    try {
      const snapshot = await invokeIpc<AgentsSnapshot>('agents:removeChannel', agentId, channelType);
      set(applySnapshot(snapshot));
    } catch (error) {
      set({ error: String(error) });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
