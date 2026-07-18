import type { GeneratedScreen, ScreenPlan } from "@/store/generation-types"
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useMemo } from "react"

type ScreenNodeData = {
  id: string
  name: string
  purpose?: string
  html?: string
  width?: number
  height?: number
  status: "planned" | "completed"
}

const NODE_PREVIEW_WIDTH = 380
const NODE_PREVIEW_HEIGHT = 238
const DEFAULT_SCREEN_WIDTH = 1440
const DEFAULT_SCREEN_HEIGHT = 900

function ScreenNode({ data }: NodeProps<Node<ScreenNodeData>>) {
  const screenWidth = data.width ?? DEFAULT_SCREEN_WIDTH
  const screenHeight = data.height ?? DEFAULT_SCREEN_HEIGHT
  const scale = Math.min(
    NODE_PREVIEW_WIDTH / screenWidth,
    NODE_PREVIEW_HEIGHT / screenHeight,
  )

  return (
    <div className="w-[420px] overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-2xl shadow-black/30">
      <Handle
        type="target"
        position={Position.Left}
        className="border-slate-950 bg-cyan-400"
      />
      <div className="flex h-12 items-center justify-between border-b border-slate-800 px-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-white">{data.name}</h3>
          <p className="text-xs text-slate-500">
            {screenWidth} x {screenHeight}
          </p>
        </div>
        {data.status === "completed" ? (
          <CheckCircle2 className="size-5 text-emerald-400" />
        ) : (
          <Loader2 className="size-5 animate-spin text-cyan-300" />
        )}
      </div>

      <div className="bg-slate-900 p-5">
        <div className="h-[238px] w-[380px] overflow-hidden rounded-lg bg-white ring-1 ring-slate-800">
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
            <div className="flex h-full items-center justify-center bg-slate-950 text-center">
              <div>
                <Loader2 className="mx-auto size-6 animate-spin text-cyan-300" />
                <p className="mt-3 text-sm text-slate-400">Waiting for HTML</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {data.purpose ? (
        <div className="border-t border-slate-800 px-4 py-3">
          <p className="line-clamp-2 text-xs leading-5 text-slate-400">
            {data.purpose}
          </p>
        </div>
      ) : null}
      <Handle
        type="source"
        position={Position.Right}
        className="border-slate-950 bg-cyan-400"
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
    x: column * 560,
    y: row * 420,
  }
}

type ScreenFlowCanvasProps = {
  screens: ScreenPlan[]
  generatedScreens: GeneratedScreen[]
}

export function ScreenFlowCanvas({
  screens,
  generatedScreens,
}: ScreenFlowCanvasProps) {
  const generatedById = useMemo(
    () => new Map(generatedScreens.map((screen) => [screen.id, screen])),
    [generatedScreens],
  )

  const flowNodes = useMemo<Node<ScreenNodeData>[]>(() => {
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

  const flowEdges = useMemo<Edge[]>(() => {
    return flowNodes.slice(1).map((node, index) => ({
      id: `${flowNodes[index].id}-${node.id}`,
      source: flowNodes[index].id,
      target: node.id,
      animated: true,
      style: {
        stroke: "#22d3ee",
      },
    }))
  }, [flowNodes])

  return (
    <div className="h-[calc(100vh-9rem)] min-h-[640px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.2}
        maxZoom={1.2}
        nodesDraggable
      >
        <Background color="#334155" gap={28} size={1} />
        <Controls className="border border-slate-800 bg-slate-900 text-slate-100" />
        <MiniMap
          pannable
          zoomable
          className="border border-slate-800 bg-slate-900"
          nodeColor={(node) =>
            (node.data as ScreenNodeData).status === "completed"
              ? "#10b981"
              : "#0f172a"
          }
        />
      </ReactFlow>
    </div>
  )
}
