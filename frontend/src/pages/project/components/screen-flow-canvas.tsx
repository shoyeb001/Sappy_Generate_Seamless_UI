import type { GeneratedScreen, ScreenPlan } from "@/store/generation-types"
import {
  Background,
  Controls,
  Handle,
  NodeResizer,
  Position,
  ReactFlow,
  useNodesState,
  type Node,
  type NodeProps,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Frame, Loader2 } from "lucide-react"
import { useEffect, useMemo } from "react"

type ScreenNodeData = {
  id: string
  name: string
  purpose?: string
  html?: string
  width?: number
  height?: number
  status: "planned" | "completed"
}

type ScreenFlowNode = Node<ScreenNodeData>

const DEFAULT_NODE_WIDTH = 380
const DEFAULT_NODE_HEIGHT = 266
const NODE_LABEL_HEIGHT = 28
const MIN_NODE_WIDTH = 260
const MIN_NODE_HEIGHT = 190
const DEFAULT_SCREEN_WIDTH = 1440
const DEFAULT_SCREEN_HEIGHT = 900

function ScreenNode({
  data,
  height,
  selected,
  width,
}: NodeProps<ScreenFlowNode>) {
  const screenWidth = data.width ?? DEFAULT_SCREEN_WIDTH
  const screenHeight = data.height ?? DEFAULT_SCREEN_HEIGHT
  const frameWidth = Math.max(width ?? DEFAULT_NODE_WIDTH, MIN_NODE_WIDTH)
  const frameHeight = Math.max(
    (height ?? DEFAULT_NODE_HEIGHT) - NODE_LABEL_HEIGHT,
    MIN_NODE_HEIGHT - NODE_LABEL_HEIGHT,
  )
  const scale = Math.min(
    frameWidth / screenWidth,
    frameHeight / screenHeight,
  )

  return (
    <div className="group relative" style={{ width: frameWidth }}>
      <NodeResizer
        color="#67e8f9"
        isVisible={selected}
        minHeight={MIN_NODE_HEIGHT}
        minWidth={MIN_NODE_WIDTH}
      />

      <Handle
        type="target"
        position={Position.Left}
        className="opacity-0"
      />

      <div className="mb-2 flex max-w-full items-center gap-2 text-[13px] font-medium text-slate-200">
        <Frame className="size-4 shrink-0 text-cyan-300" />
        <span className="truncate">{data.name}</span>
        {data.status === "planned" ? (
          <Loader2 className="size-3.5 shrink-0 animate-spin text-cyan-300" />
        ) : null}
      </div>

      <div
        className={[
          "overflow-hidden bg-white shadow-2xl shadow-black/35",
          selected
            ? "ring-2 ring-cyan-300"
            : "ring-1 ring-white/15 transition group-hover:ring-cyan-300/70",
        ].join(" ")}
        style={{ height: frameHeight, width: frameWidth }}
      >
        {data.html ? (
          <iframe
            srcDoc={data.html}
            title={data.name}
            sandbox="allow-scripts"
            style={{
              width: screenWidth,
              height: screenHeight,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
            className="pointer-events-none border-0 bg-white"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#0b1220]">
            <div className="absolute inset-0 animate-pulse bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.08),transparent)]" />
            <div className="relative grid h-[178px] w-[284px] grid-cols-[72px_1fr] gap-3 rounded-sm border border-white/10 bg-slate-950/70 p-3">
              <div className="space-y-2 border-r border-white/10 pr-3">
                <div className="h-4 rounded-sm bg-cyan-300/45" />
                <div className="h-3 rounded-sm bg-white/16" />
                <div className="h-3 rounded-sm bg-white/16" />
                <div className="h-3 rounded-sm bg-white/10" />
              </div>
              <div className="space-y-3">
                <div className="h-6 w-2/3 rounded-sm bg-white/20" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-14 rounded-sm bg-white/12" />
                  <div className="h-14 rounded-sm bg-cyan-300/18" />
                  <div className="h-14 rounded-sm bg-white/12" />
                </div>
                <div className="h-16 rounded-sm bg-white/10" />
              </div>
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="opacity-0"
      />
    </div>
  )
}

const nodeTypes = {
  screen: ScreenNode,
}

function getNodePosition(index: number) {
  const columns = 2
  const column = index % columns
  const row = Math.floor(index / columns)

  return {
    x: column * 520,
    y: row * 360,
  }
}

type ScreenFlowCanvasProps = {
  screens: ScreenPlan[]
  generatedScreens: GeneratedScreen[]
  selectedScreenId: string | null
  onSelectScreen: (screenId: string | null) => void
}

export function ScreenFlowCanvas({
  screens,
  generatedScreens,
  selectedScreenId,
  onSelectScreen,
}: ScreenFlowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<ScreenFlowNode>([])

  const generatedById = useMemo(
    () => new Map(generatedScreens.map((screen) => [screen.id, screen])),
    [generatedScreens],
  )

  const plannedNodes = useMemo<ScreenFlowNode[]>(() => {
    const baseScreens =
      screens.length > 0
        ? screens
        : generatedScreens.map((screen) => ({
            id: screen.id,
            name: screen.name,
            description: screen.name,
            purpose: "Generated UI screen",
          }))

    return baseScreens.map((screen, index) => {
      const generated = generatedById.get(screen.id)

      return {
        id: screen.id,
        type: "screen",
        position: getNodePosition(index),
        width: DEFAULT_NODE_WIDTH,
        height: DEFAULT_NODE_HEIGHT,
        data: {
          id: screen.id,
          name: generated?.name ?? screen.name,
          purpose: screen.purpose,
          html: generated?.html,
          width: generated?.width,
          height: generated?.height,
          status: generated ? "completed" : "planned",
        },
      }
    })
  }, [generatedById, generatedScreens, screens])

  useEffect(() => {
    setNodes((currentNodes) => {
      const currentById = new Map(currentNodes.map((node) => [node.id, node]))

      return plannedNodes.map((node) => {
        const current = currentById.get(node.id)

        if (!current) {
          return {
            ...node,
            selected: node.id === selectedScreenId,
          }
        }

        return {
          ...current,
          data: node.data,
          height: current.height ?? node.height,
          position: current.position,
          selected: current.id === selectedScreenId,
          type: node.type,
          width: current.width ?? node.width,
        }
      })
    })
  }, [plannedNodes, selectedScreenId, setNodes])

  return (
    <div className="h-[calc(100vh-9rem)] min-h-[640px] overflow-hidden rounded-2xl border border-slate-800 bg-[#111318]">
      <ReactFlow
        nodes={nodes}
        edges={[]}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={(_, node) => onSelectScreen(node.id)}
        onPaneClick={() => onSelectScreen(null)}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.2}
        maxZoom={1.2}
        nodesDraggable
      >
        <Background color="#3f4652" gap={24} size={1.25} />
        <Controls className="border border-slate-800 bg-slate-900 text-slate-100" />
      </ReactFlow>
    </div>
  )
}
