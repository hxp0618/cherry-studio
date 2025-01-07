import {
  CloseOutlined,
  FileSearchOutlined,
  FolderOutlined,
  PictureOutlined,
  TranslationOutlined
} from '@ant-design/icons'
import { isMac } from '@renderer/config/constant'
import { useTheme } from '@renderer/context/ThemeProvider'
import { useSettings } from '@renderer/hooks/useSettings'
import { useAppDispatch } from '@renderer/store'
import { setClickAssistantToShowTopic, setCustomCss, setShowTopicTime, setSidebarIcons } from '@renderer/store/settings'
import { ThemeMode } from '@renderer/types'
import { Button, Input, Select, Switch } from 'antd'
import { FC, useCallback, useMemo, useState } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { SidebarIcon } from '../../store/settings'
import { SettingContainer, SettingDivider, SettingGroup, SettingRow, SettingRowTitle, SettingTitle } from '.'

const DisplaySettings: FC = () => {
  const {
    setTheme,
    theme,
    windowStyle,
    setWindowStyle,
    topicPosition,
    setTopicPosition,
    clickAssistantToShowTopic,
    showTopicTime,
    customCss,
    sidebarIcons
  } = useSettings()
  const { theme: themeMode } = useTheme()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  // 使用useMemo缓存默认图标数组
  const defaultIcons = useMemo(
    () => [
      { id: 'chat', icon: 'icon-chat', title: 'assistants.title' },
      { id: 'agents', icon: 'icon-business-smart-assistant', title: 'agents.title' },
      { id: 'paintings', icon: 'icon-picture', title: 'paintings.title' },
      { id: 'translate', icon: 'icon-translate', title: 'translate.title' },
      { id: 'minapp', icon: 'icon-appstore', title: 'minapp.title' },
      { id: 'knowledge', icon: 'icon-search', title: 'knowledge_base.title' },
      { id: 'files', icon: 'icon-folder', title: 'files.title' }
    ],
    []
  )

  const [visibleIcons, setVisibleIcons] = useState(sidebarIcons?.visible || defaultIcons)
  const [disabledIcons, setDisabledIcons] = useState(sidebarIcons?.disabled || [])

  // 使用useCallback优化回调函数
  const handleWindowStyleChange = useCallback(
    (checked: boolean) => {
      setWindowStyle(checked ? 'transparent' : 'opaque')
    },
    [setWindowStyle]
  )

  const handleReset = useCallback(() => {
    setVisibleIcons([...defaultIcons])
    setDisabledIcons([])
    dispatch(setSidebarIcons({ visible: defaultIcons, disabled: [] }))
  }, [defaultIcons, dispatch])

  const onDragEnd = useCallback(
    (result) => {
      if (!result.destination) return

      const { source, destination } = result

      if (source.droppableId === destination.droppableId) {
        const list = source.droppableId === 'visible' ? [...visibleIcons] : [...disabledIcons]
        const [removed] = list.splice(source.index, 1)
        list.splice(destination.index, 0, removed)

        if (source.droppableId === 'visible') {
          setVisibleIcons(list)
          dispatch(setSidebarIcons({ visible: list, disabled: disabledIcons }))
        } else {
          setDisabledIcons(list)
          dispatch(setSidebarIcons({ visible: visibleIcons, disabled: list }))
        }
        return
      }

      const sourceList = source.droppableId === 'visible' ? [...visibleIcons] : [...disabledIcons]
      const destList = destination.droppableId === 'visible' ? [...visibleIcons] : [...disabledIcons]

      const [removed] = sourceList.splice(source.index, 1)
      const targetList = destList.filter((icon) => icon.id !== removed.id)
      targetList.splice(destination.index, 0, removed)

      const newVisibleIcons = destination.droppableId === 'visible' ? targetList : sourceList
      const newDisabledIcons = destination.droppableId === 'disabled' ? targetList : sourceList

      setVisibleIcons(newVisibleIcons)
      setDisabledIcons(newDisabledIcons)
      dispatch(setSidebarIcons({ visible: newVisibleIcons, disabled: newDisabledIcons }))
    },
    [visibleIcons, disabledIcons, dispatch]
  )

  const moveIcon = useCallback(
    (icon: SidebarIcon, fromList: 'visible' | 'disabled') => {
      if (fromList === 'visible') {
        const newVisibleIcons = visibleIcons.filter((i) => i.id !== icon.id)
        const newDisabledIcons = disabledIcons.some((i) => i.id === icon.id) ? disabledIcons : [...disabledIcons, icon]

        setVisibleIcons(newVisibleIcons)
        setDisabledIcons(newDisabledIcons)
        dispatch(setSidebarIcons({ visible: newVisibleIcons, disabled: newDisabledIcons }))
      } else {
        const newDisabledIcons = disabledIcons.filter((i) => i.id !== icon.id)
        const newVisibleIcons = visibleIcons.some((i) => i.id === icon.id) ? visibleIcons : [...visibleIcons, icon]

        setDisabledIcons(newDisabledIcons)
        setVisibleIcons(newVisibleIcons)
        dispatch(setSidebarIcons({ visible: newVisibleIcons, disabled: newDisabledIcons }))
      }
    },
    [visibleIcons, disabledIcons, dispatch]
  )

  // 使用useMemo缓存图标映射
  const iconMap = useMemo(
    () => ({
      chat: <i className="iconfont icon-chat" />,
      agents: <i className="iconfont icon-business-smart-assistant" />,
      paintings: <PictureOutlined style={{ fontSize: 16 }} />,
      translate: <TranslationOutlined />,
      minapp: <i className="iconfont icon-appstore" />,
      knowledge: <FileSearchOutlined />,
      files: <FolderOutlined />
    }),
    []
  )

  const renderIcon = useCallback(
    (icon) => {
      return iconMap[icon.id] || <i className={`iconfont ${icon.icon}`} />
    },
    [iconMap]
  )

  return (
    <SettingContainer theme={themeMode}>
      <SettingGroup theme={theme}>
        <SettingTitle>{t('settings.display.title')}</SettingTitle>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>{t('settings.theme.title')}</SettingRowTitle>
          <Select
            value={theme}
            style={{ width: 120 }}
            onChange={setTheme}
            options={[
              { value: ThemeMode.light, label: t('settings.theme.light') },
              { value: ThemeMode.dark, label: t('settings.theme.dark') },
              { value: ThemeMode.auto, label: t('settings.theme.auto') }
            ]}
          />
        </SettingRow>
        {isMac && (
          <>
            <SettingDivider />
            <SettingRow>
              <SettingRowTitle>{t('settings.theme.window.style.transparent')}</SettingRowTitle>
              <Switch checked={windowStyle === 'transparent'} onChange={handleWindowStyleChange} />
            </SettingRow>
          </>
        )}
      </SettingGroup>
      <SettingGroup theme={theme}>
        <SettingTitle>{t('settings.display.topic.title')}</SettingTitle>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>{t('settings.topic.position')}</SettingRowTitle>
          <Select
            value={topicPosition || 'right'}
            style={{ width: 120 }}
            onChange={setTopicPosition}
            options={[
              { value: 'left', label: t('settings.topic.position.left') },
              { value: 'right', label: t('settings.topic.position.right') }
            ]}
          />
        </SettingRow>
        <SettingDivider />
        {topicPosition === 'left' && (
          <>
            <SettingRow>
              <SettingRowTitle>{t('settings.advanced.auto_switch_to_topics')}</SettingRowTitle>
              <Switch
                checked={clickAssistantToShowTopic}
                onChange={(checked) => dispatch(setClickAssistantToShowTopic(checked))}
              />
            </SettingRow>
            <SettingDivider />
          </>
        )}
        <SettingRow>
          <SettingRowTitle>{t('settings.topic.show.time')}</SettingRowTitle>
          <Switch checked={showTopicTime} onChange={(checked) => dispatch(setShowTopicTime(checked))} />
        </SettingRow>
      </SettingGroup>
      <SettingGroup theme={theme}>
        <SettingTitle>{t('settings.display.sidebar.title')}</SettingTitle>
        <SettingDivider />
        <DragDropContext onDragEnd={onDragEnd}>
          <IconSection>
            <IconColumn>
              <h4>{t('settings.display.sidebar.visible')}</h4>
              <Droppable droppableId="visible">
                {(provided) => (
                  <IconList ref={provided.innerRef} {...provided.droppableProps}>
                    {visibleIcons.map((icon, index) => (
                      <Draggable key={icon.id} draggableId={icon.id} index={index}>
                        {(provided) => (
                          <IconItem ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <IconContent>
                              {renderIcon(icon)}
                              <span>{t(icon.title)}</span>
                            </IconContent>
                            <CloseButton onClick={() => moveIcon(icon, 'visible')}>
                              <CloseOutlined />
                            </CloseButton>
                          </IconItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </IconList>
                )}
              </Droppable>
            </IconColumn>
            <ResetButtonWrapper>
              <Button onClick={handleReset}>{t('common.reset')}</Button>
            </ResetButtonWrapper>
            <IconColumn>
              <h4>{t('settings.display.sidebar.disabled')}</h4>
              <Droppable droppableId="disabled">
                {(provided) => (
                  <IconList ref={provided.innerRef} {...provided.droppableProps}>
                    {disabledIcons.map((icon, index) => (
                      <Draggable key={icon.id} draggableId={icon.id} index={index}>
                        {(provided) => (
                          <IconItem ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <IconContent>
                              {renderIcon(icon)}
                              <span>{t(icon.title)}</span>
                            </IconContent>
                            <CloseButton onClick={() => moveIcon(icon, 'disabled')}>
                              <CloseOutlined />
                            </CloseButton>
                          </IconItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </IconList>
                )}
              </Droppable>
            </IconColumn>
          </IconSection>
        </DragDropContext>
      </SettingGroup>
      <SettingGroup theme={theme}>
        <SettingTitle>{t('settings.display.custom.css')}</SettingTitle>
        <SettingDivider />
        <Input.TextArea
          value={customCss}
          onChange={(e) => dispatch(setCustomCss(e.target.value))}
          placeholder={t('settings.display.custom.css.placeholder')}
          style={{
            minHeight: 200,
            fontFamily: 'monospace'
          }}
        />
      </SettingGroup>
    </SettingContainer>
  )
}

const IconSection = styled.div`
  display: flex;
  gap: 20px;
  padding: 10px;
  background: var(--color-background);
`

const IconColumn = styled.div`
  flex: 1;

  h4 {
    margin-bottom: 10px;
    color: var(--color-text);
    font-weight: normal;
  }
`

const IconList = styled.div`
  min-height: 200px;
  padding: 10px;
  background: var(--color-background-soft);
  border-radius: 8px;
  border: 1px solid var(--color-border);
`

const IconItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: move;
`

const IconContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  .iconfont {
    font-size: 16px;
    color: var(--color-text);
  }

  span {
    color: var(--color-text);
  }
`

const CloseButton = styled.div`
  cursor: pointer;
  color: var(--color-text-2);
  opacity: 0;
  transition: all 0.2s;

  &:hover {
    color: var(--color-text);
  }

  ${IconItem}:hover & {
    opacity: 1;
  }
`

const ResetButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 40px;
`

export default DisplaySettings
