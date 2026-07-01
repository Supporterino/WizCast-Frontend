import { BaseDirectory, appDataDir } from '@tauri-apps/api/path';
import { readDir, readTextFile } from '@tauri-apps/plugin-fs';
import { useCallback, useState } from 'react';
import { Button, Code } from '@mantine/core';
import type { FunctionComponent } from 'react';
import { FlexCol } from '@/components/Layout/FlexCol.tsx';

export const DebugFileExplorer: FunctionComponent = () => {
  const [debugText, setDebugText] = useState<string>('');
  const [debugDir, setDebugDir] = useState<string>('');

  const list = useCallback(async () => {
    const appDataDirPath = await appDataDir();
    setDebugDir(appDataDirPath);
    setDebugText(JSON.stringify(await readDir('.', { baseDir: BaseDirectory.AppData }), null, 2));
  }, []);

  const read = useCallback(async () => {
    const appDataDirPath = await appDataDir();
    setDebugDir(appDataDirPath);
    setDebugText(JSON.stringify(JSON.parse(await readTextFile('games.json', { baseDir: BaseDirectory.AppData })), null, 2));
  }, []);

  return (
    <FlexCol fullWidth p="md">
      <Code m="sm" style={{ textWrap: 'balance' }}>
        {debugDir}
      </Code>
      <Code block>{debugText}</Code>
      <Button onClick={list}>List Files</Button>
      <Button onClick={read}>Read state file</Button>
    </FlexCol>
  );
};
