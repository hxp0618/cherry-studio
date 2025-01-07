import { BarsOutlined, SettingOutlined } from '@ant-design/icons'
import AddAssistantPopup from '@renderer/components/Popups/AddAssistantPopup'
import { useAssistants, useDefaultAssistant } from '@renderer/hooks/useAssistant'
import { useSettings } from '@renderer/hooks/useSettings'
import { useShowTopics } from '@renderer/hooks/useStore'
import { EVENT_NAMES, EventEmitter } from '@renderer/services/EventService'
import { Assistant, Topic } from '@renderer/types'
import { uuid } from '@renderer/utils'
import { Segmented as AntSegmented, SegmentedProps } from 'antd'
import { FC, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Assistants from './AssistantsTab'
import Settings from './SettingsTab'
import Topics from './TopicsTab'

interface Props {
  activeAssistant: Assistant
  activeTopic: Topic
  setActiveAssistant: (assistant: Assistant) => void
  setActiveTopic: (topic: Topic) => void
  position: 'left' | 'right'
}

type Tab = 'assistants' | 'topic' | 'settings'

let _tab: any = ''

const HomeTabs: FC<Props> = ({ activeAssistant, activeTopic, setActiveAssistant, setActiveTopic, position }) => {
  const { addAssistant } = useAssistants()
  const [tab, setTab] = useState<Tab>(position === 'left' ? _tab || 'assistants' : 'topic')
  const { topicPosition } = useSettings()
  const { defaultAssistant } = useDefaultAssistant()
  const { toggleShowTopics } = useShowTopics()
  const [width, setWidth] = useState(260) // 减小初始宽度
  const isResizing = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const { t } = useTranslation()

  const borderStyle = '0.5px solid var(--color-border)'
  const border =
    position === 'left' ? { borderRight: borderStyle } : { borderLeft: borderStyle, borderTopLeftRadius: 0 }

  if (position === 'left' && topicPosition === 'left') {
    _tab = tab
  }

  const showTab = !(position === 'left' && topicPosition === 'right')

  const assistantTab = {
    label: t('assistants.abbr'),
    value: 'assistants',
    icon: <i className="iconfont icon-business-smart-assistant" />
  }

  const onCreateAssistant = async () => {
    const assistant = await AddAssistantPopup.show()
    assistant && setActiveAssistant(assistant)
  }

  const onCreateDefaultAssistant = () => {
    const assistant = { ...defaultAssistant, id: uuid() }
    addAssistant(assistant)
    setActiveAssistant(assistant)
  }

  const startResizing = (e: React.MouseEvent) => {
    isResizing.current = true
    startX.current = e.clientX
    startWidth.current = width
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', stopResizing)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return
    const delta = position === 'left' ? e.clientX - startX.current : startX.current - e.clientX
    const newWidth = Math.min(Math.max(startWidth.current + delta, 180), 400) // 调整最小和最大宽度
    setWidth(newWidth)
  }

  const stopResizing = () => {
    isResizing.current = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', stopResizing)
  }

  useEffect(() => {
    const unsubscribes = [
      EventEmitter.on(EVENT_NAMES.SHOW_ASSISTANTS, (): any => {
        showTab && setTab('assistants')
      }),
      EventEmitter.on(EVENT_NAMES.SHOW_TOPIC_SIDEBAR, (): any => {
        showTab && setTab('topic')
      }),
      EventEmitter.on(EVENT_NAMES.SHOW_CHAT_SETTINGS, (): any => {
        showTab && setTab('settings')
      }),
      EventEmitter.on(EVENT_NAMES.SWITCH_TOPIC_SIDEBAR, () => {
        showTab && setTab('topic')
        if (position === 'left' && topicPosition === 'right') {
          toggleShowTopics()
        }
      })
    ]
    return () => unsubscribes.forEach((unsub) => unsub())
  }, [position, showTab, tab, toggleShowTopics, topicPosition])

  useEffect(() => {
    if (position === 'right' && topicPosition === 'right' && tab === 'assistants') {
      setTab('topic')
    }
    if (position === 'left' && topicPosition === 'right' && tab !== 'assistants') {
      setTab('assistants')
    }
  }, [position, tab, topicPosition])

  return (
    <Container style={{ ...border, width: `${width}px` }} className="home-tabs">
      {showTab && (
        <Segmented
          value={tab}
          style={{
            borderRadius: 0,
            padding: '8px 0', // 减小内边距
            margin: '0 8px', // 减小外边距
            paddingBottom: 8,
            borderBottom: '0.5px solid var(--color-border)',
            gap: 2
          }}
          options={
            [
              position === 'left' && topicPosition === 'left' ? assistantTab : undefined,
              {
                label: t('common.topics'),
                value: 'topic',
                icon: <BarsOutlined />
              },
              {
                label: t('settings.title'),
                value: 'settings',
                icon: <SettingOutlined />
              }
            ].filter(Boolean) as SegmentedProps['options']
          }
          onChange={(value) => setTab(value as 'topic' | 'settings')}
          block
        />
      )}
      <TabContent className="home-tabs-content">
        {tab === 'assistants' && (
          <Assistants
            activeAssistant={activeAssistant}
            setActiveAssistant={setActiveAssistant}
            onCreateAssistant={onCreateAssistant}
            onCreateDefaultAssistant={onCreateDefaultAssistant}
          />
        )}
        {tab === 'topic' && (
          <Topics assistant={activeAssistant} activeTopic={activeTopic} setActiveTopic={setActiveTopic} />
        )}
        {tab === 'settings' && <Settings assistant={activeAssistant} />}
      </TabContent>
      <ResizeHandle
        onMouseDown={startResizing}
        style={{ left: position === 'left' ? 'auto' : 0, right: position === 'left' ? 0 : 'auto' }}
      />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--navbar-height));
  background-color: var(--color-background);
  overflow: hidden;
  position: relative;
  .collapsed {
    width: 0;
    border-left: none;
  }
`

const TabContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
`

const ResizeHandle = styled.div`
  position: absolute;
  top: 0;
  width: 4px;
  height: 100%;
  cursor: col-resize;
  background: transparent;
  &:hover {
    background: var(--color-border);
  }
`

const Segmented = styled(AntSegmented)`
  .ant-segmented-item {
    overflow: hidden;
    transition: none !important;
    height: 32px; // 减小高度
    line-height: 32px;
    background-color: transparent;
    user-select: none;
  }
  .ant-segmented-item-selected {
    background-color: var(--color-background-soft);
    border: 0.5px solid var(--color-border);
    transition: none !important;
  }
  .ant-segmented-item-label {
    align-items: center;
    display: flex;
    flex-direction: row;
    justify-content: center;
    font-size: 12px; // 减小字体大小
    height: 100%;
  }
  .iconfont {
    font-size: 12px;
    margin-left: -2px;
  }
  .anticon-setting {
    font-size: 12px;
  }
  .icon-business-smart-assistant {
    margin-right: -2px;
  }
  .ant-segmented-item-icon + * {
    margin-left: 4px;
  }
  .ant-segmented-thumb {
    transition: none !important;
    background-color: var(--color-background-soft);
    border: 0.5px solid var(--color-border);
  }
`

export default HomeTabs
