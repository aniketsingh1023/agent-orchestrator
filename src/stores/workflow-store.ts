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
import { type NodeData, type NodeType, NODE_DEFINITIONS } from "@/types/workflow";

let nodeIdCounter = 0;

export function generateNodeId(): string {
  return `node_${Date.now()}_${++nodeIdCounter}`;
}

interface WorkflowState {
  // Workflow metadata
  workflowId: string | null;
  workflowName: string;
  isDirty: boolean;

  // Canvas state
  nodes: Node<NodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;

  // Actions
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
  setNodeExecutionState: (id: string, state: NodeData["executionState"], output?: string, error?: string) => void;
  resetExecutionStates: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflowId: null,
  workflowName: "Untitled Workflow",
  isDirty: false,

  nodes: [],
  edges: [],
  selectedNodeId: null,

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as Node<NodeData>[],
      isDirty: true,
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
      isDirty: true,
    });
  },

  onConnect: (connection: Connection) => {
    const edge = {
      ...connection,
      type: "smoothstep",
      animated: false,
      markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
      style: { strokeWidth: 2, stroke: "#94a3b8" },
    };
    set({
      edges: addEdge(edge, get().edges),
      isDirty: true,
    });
  },

  addNode: (type, position) => {
    const def = NODE_DEFINITIONS[type];
    const id = generateNodeId();
    const newNode: Node<NodeData> = {
      id,
      type: "custom",
      position,
      data: {
        label: def.label,
        type,
        config: { ...def.defaultConfig },
        executionState: "idle",
      },
    };
    set({
      nodes: [...get().nodes, newNode],
      isDirty: true,
      selectedNodeId: id,
    });
  },

  removeNode: (id) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
      isDirty: true,
    });
  },

  selectNode: (id) => set({ selectedNodeId: id }),

  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
      isDirty: true,
    });
  },

  updateNodeConfig: (id, config) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, config: { ...n.data.config, ...config } } }
          : n
      ),
      isDirty: true,
    });
  },

  setWorkflow: (id, name, nodes, edges) => {
    set({
      workflowId: id,
      workflowName: name,
      nodes,
      edges,
      isDirty: false,
      selectedNodeId: null,
    });
  },

  setWorkflowName: (name) => set({ workflowName: name, isDirty: true }),

  clearCanvas: () =>
    set({
      workflowId: null,
      workflowName: "Untitled Workflow",
      nodes: [],
      edges: [],
      selectedNodeId: null,
      isDirty: false,
    }),

  setNodeExecutionState: (id, executionState, output, error) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, executionState, output, error } }
          : n
      ),
    });
  },

  resetExecutionStates: () => {
    set({
      nodes: get().nodes.map((n) => ({
        ...n,
        data: { ...n.data, executionState: "idle" as const, output: undefined, error: undefined },
      })),
    });
  },
}));
