import OpenAI from 'openai'
import config from 'config'
import { Run } from 'openai/resources/beta/threads/runs/runs'
import { delay } from 'utils/time.util'
import logger from 'utils/logger.util'
import { toolFunctions } from 'constants/assistant.constant'

const OPENAI_KEY = config.get<string>('OPENAI_KEY')
const ASSISTANT_KEY = config.get<string>('ASSISTANT_KEY')

const openai = new OpenAI({
    apiKey: OPENAI_KEY,
})

export const threadCreate = () => openai.beta.threads.create()

export const messagesRetrieve = (threadId: string, messageId: string) =>
    openai.beta.threads.messages.retrieve(threadId, messageId)

export const messagesList = (threadId: string, limit?: number) =>
    openai.beta.threads.messages.list(threadId, { limit })

export const messagesCreate = (threadId: string, content: string) =>
    openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content,
    })

export const runCreate = (threadId: string) =>
    openai.beta.threads.runs.create(threadId, {
        assistant_id: ASSISTANT_KEY,
    })

export const runCancel = (threadId: string, runId: string) =>
    openai.beta.threads.runs.cancel(threadId, runId)

export const runSubmitToolOutputs = (
    threadId: string,
    runId: string,
    toolsOutput: any[],
) =>
    openai.beta.threads.runs.submitToolOutputs(threadId, runId, {
        tool_outputs: toolsOutput,
    })

type RunStatusCheckLoop = Exclude<
    Run['status'],
    'in_progress' | 'requires_action' | 'queued'
>

export const statusCheckLoop = async (
    threadId: string,
    runId: string,
): Promise<RunStatusCheckLoop> => {
    try {
        const run = await openai.beta.threads.runs.retrieve(threadId, runId)
        logger.debug(run.status)
        if (run.status === 'queued') {
            await delay(2000)
            return statusCheckLoop(threadId, runId)
        }
        if (run.status === 'in_progress') {
            await delay(2000)
            return statusCheckLoop(threadId, runId)
        }
        if (run.status === 'requires_action') {
            const requiredActions =
                run.required_action!.submit_tool_outputs.tool_calls
            logger.debug(requiredActions)
            const toolsOutput = []

            for (const action of requiredActions) {
                const functionName = action.function.name
                const functionArgs = JSON.parse(action.function.arguments)

                const output = await toolFunctions[functionName].apply(null, [
                    functionArgs,
                ])

                toolsOutput.push({
                    tool_call_id: action.id,
                    output: output,
                })
            }
            await runSubmitToolOutputs(threadId, runId, toolsOutput)
            return statusCheckLoop(threadId, runId)
        }
        return run.status as RunStatusCheckLoop
    } catch (e) {
        logger.debug(e)
        await runCancel(threadId, runId)
        return 'cancelled'
    }
}
