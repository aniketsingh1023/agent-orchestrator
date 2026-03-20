import { create } from "zustand";
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Connection,
  MarkerType,
} from "@xyflow/react";
import { type NodeData, type NodeType, type ExecutionState, NODE_DEFINITIONS } from "@/types/workflow";

let nodeIdCounter = 0;

function generateNodeId(): string {
  return `node_${Date.now()}_${++nodeIdCounter}`;
}

interface WorkflowState {
  workflowId: string | null;
  workflowName: string;
  isDirty: boolean;
  executionId: string | null;
  isExecuting: boolean;

  nodes: Node<NodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;

  onNodesChange: OnNodesChange<Node<NodeData>>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  removeNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  updateNodeData: (id: string, data: Partial<NodeData>) => void;
  updateNodeConfig: (id: string, config: Record<string, unknown>) => void;

  setWorkflow: (id: string, name: string, nodes: Node<NodeData>[], edges: Edge[]) => void;
  setWorkflowName: (name: string) => void;
  clearCanvas: () => void;

  // Execution
  setExecutionId: (id: string | null) => void;
  setIsExecuting: (v: boolean) => void;
  setNodeExecutionState: (nodeId: string, state: ExecutionState, extra?: { output?: string; error?: string; durationMs?: number; logCount?: number }) => void;
  resetExecutionStates: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflowId: null,
  workflowName: "Untitled Workflow",
  isDirty: false,
  executionId: null,
  isExecuting: false,

  nodes: [],
  edges: [],
  selectedNodeId: null,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as Node<NodeData>[], isDirty: true });
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges), isDirty: true });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge({
        ...connection,
        type: "smoothstep",
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
        style: { strokeWidth: 2, stroke: "#94a3b8" },
      }, get().edges),
      isDirty: true,
    });
  },

  addNode: (type, position) => {
    const def = NODE_DEFINITIONS[type];
    const id = generateNodeId();
    set({
      nodes: [...get().nodes, {
        id,
        type: "custom",
        position,
        data: {
          label: def.label,
          type,
          config: { ...def.defaultConfig },
          executionState: "idle",
        },
      }],
      isDirty: true,
      selectedNodeId: id,
    });
  },

  removeNode: (id) => set({
    nodes: get().nodes.filter((n) => n.id !== id),
    edges: get().edges.filter((e) => e.source !== id && e.target !== id),
    selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
    isDirty: true,
  }),

  selectNode: (id) => set({ selectedNodeId: id }),

  updateNodeData: (id, data) => set({
    nodes: get().nodes.map((n) => n.id === id ? { ...n, data: { ...n.data, ...data } } : n),
    isDirty: true,
  }),

  updateNodeConfig: (id, config) => set({
    nodes: get().nodes.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, config: { ...n.data.config, ...config } } } : n
    ),
    isDirty: true,
  }),

  setWorkflow: (id, name, nodes, edges) => set({
    workflowId: id, workflowName: name, nodes, edges, isDirty: false, selectedNodeId: null,
  }),

  setWorkflowName: (name) => set({ workflowName: name, isDirty: true }),

  clearCanvas: () => set({
    workflowId: null, workflowName: "Untitled Workflow",
    nodes: [], edges: [], selectedNodeId: null, isDirty: false,
    executionId: null, isExecuting: false,
  }),

  setExecutionId: (id) => set({ executionId: id }),
  setIsExecuting: (v) => set({ isExecuting: v }),

  setNodeExecutionState: (nodeId, executionState, extra) => set({
    nodes: get().nodes.map((n) =>
      n.id === nodeId ? {
        ...n,
        data: {
          ...n.data,
          executionState,
          ...(extra?.output !== undefined ? { output: extra.output } : {}),
          ...(extra?.error !== undefined ? { error: extra.error } : {}),
          ...(extra?.durationMs !== undefined ? { durationMs: extra.durationMs } : {}),
          ...(extra?.logCount !== undefined ? { logCount: extra.logCount } : {}),
        },
      } : n
    ),
  }),

  resetExecutionStates: () => set({
    nodes: get().nodes.map((n) => ({
      ...n,
      data: { ...n.data, executionState: "idle" as const, output: undefined, error: undefined, durationMs: undefined, logCount: undefined },
    })),
  }),
}));
