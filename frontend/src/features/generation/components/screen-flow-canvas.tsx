import {
  Background,
  Controls,
  Handle,
  type Node,
  type NodeProps,
  NodeResizer,
  Position,
  ReactFlow,
  useNodesState,
} from "@xyflow/react"
import type { GeneratedScreen, ScreenPlan } from "~/features/generation/types"
import "@xyflow/react/dist/style.css"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"

type ScreenNodeData = {
  id: string
  name: string
  purpose?: string
  html?: string
  width?: number
  height?: number
  marker: string
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
    MIN_NODE_HEIGHT - NODE_LABEL_HEIGHT
  )
  const scale = Math.min(frameWidth / screenWidth, frameHeight / screenHeight)
  const isPlanned = data.status === "planned"

  return (
    <div className="group relative" style={{ width: frameWidth }}>
      <NodeResizer
        color="var(--signal)"
        isVisible={selected}
        minHeight={MIN_NODE_HEIGHT}
        minWidth={MIN_NODE_WIDTH}
      />

      <Handle type="target" position={Position.Left} className="opacity-0" />

      <div className="mb-2 flex max-w-full items-center gap-2">
        <span
          className={[
            "font-mono text-[11px] uppercase tracking-[0.08em]",
            isPlanned ? "text-primary" : "text-muted-foreground",
          ].join(" ")}
        >
          {isPlanned ? "plotting" : "ready"}
        </span>
        <span className="truncate font-medium text-[13px] text-foreground">
          {data.name}
        </span>
        {isPlanned ? (
          <Loader2 className="size-3.5 shrink-0 animate-spin text-primary" />
        ) : null}
      </div>

      <div
        className={[
          "crop-frame overflow-hidden bg-white shadow-2xl shadow-black/25 transition-colors",
          selected
            ? "text-primary ring-2 ring-primary"
            : "text-muted-foreground ring-1 ring-border group-hover:text-primary group-hover:ring-primary/60",
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
            className="pointer-events-none animate-plot-in border-0 bg-white"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-muted">
            <div className="absolute inset-0 animate-pulse bg-[linear-gradient(90deg,transparent,var(--accent),transparent)]" />
            <div className="relative grid h-44.5 w-71 grid-cols-[72px_1fr] gap-3 border border-border bg-card p-3">
              <div className="space-y-2 border-border border-r pr-3">
                <div className="h-4 bg-primary/45" />
                <div className="h-3 bg-foreground/16" />
                <div className="h-3 bg-foreground/16" />
                <div className="h-3 bg-foreground/10" />
              </div>
              <div className="space-y-3">
                <div className="h-6 w-2/3 bg-foreground/20" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-14 bg-foreground/12" />
                  <div className="h-14 bg-primary/25" />
                  <div className="h-14 bg-foreground/12" />
                </div>
                <div className="h-16 bg-foreground/10" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] text-muted-foreground uppercase tracking-[0.08em]">
        <span className="tabular-nums">
          {screenWidth} × {screenHeight}
        </span>
        <span
          className={selected ? "text-primary tabular-nums" : "tabular-nums"}
        >
          {data.marker}
        </span>
      </div>

      <Handle type="source" position={Position.Right} className="opacity-0" />
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

  const generatedById = new Map(
    generatedScreens.map((screen) => [screen.id, screen])
  )

  const plannedNodes: ScreenFlowNode[] = (() => {
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
          marker: `S-${String(index + 1).padStart(2, "0")}`,
          status: generated ? "completed" : "planned",
        },
      }
    })
  })()

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
    <div className="h-[calc(100vh-9rem)] min-h-160 overflow-hidden border border-border bg-muted/40">
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
        className="[&_.react-flow__attribution]:bg-card! [&_.react-flow__attribution]:text-muted-foreground! [&_.react-flow__attribution_a]:text-muted-foreground!"
      >
        <Background color="var(--border)" gap={28} size={1} />
        <Controls className="overflow-hidden border border-border shadow-none [&_button:hover]:bg-muted! [&_button]:border-border! [&_button]:bg-card! [&_button]:text-foreground! [&_button_path]:fill-foreground!" />
      </ReactFlow>
    </div>
  )
}
