import React, { useEffect, createRef, useState } from 'react';
import { styled } from '@superset-ui/core';
import { EngineeringMetricsInputFormProps, EngineeringMetricsInputFormStylesProps } from './types';
//import Dropdown from 'react-multilevel-dropdown';

const Styles = styled.div<EngineeringMetricsInputFormStylesProps>`
  background-color: ${({ theme }) => theme.colors.secondary.light2};
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;

  h3 {
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.gridUnit * 3}px;
    font-size: ${({ theme, headerFontSize }) =>
      theme.typography.sizes[headerFontSize]}px;
    font-weight: ${({ theme, boldText }) =>
      theme.typography.weights[boldText ? 'bold' : 'normal']};
  }

  pre {
    height: ${({ theme, headerFontSize, height }) =>
      height - theme.gridUnit * 12 - theme.typography.sizes[headerFontSize]}px;
  }

  .selection {
    margin-top: 20px;
    font-size: 16px;
    font-weight: bold;
  }
`;

export default function EngineeringMetricsInputForm(props: EngineeringMetricsInputFormProps) {
  const { data, height, width } = props;
  const rootElem = createRef<HTMLDivElement>();
  //const [selection, setSelection] = useState('');
  console.log('Plugin data', data);

  useEffect(() => {
    const root = rootElem.current as HTMLElement;
    console.log('Plugin element', root);
  });

  console.log('Plugin props', props);

  // Group data by Business Unit and Account
  /*const groupedData = data.data.reduce((acc, item) => {
    const { "Business Unit": businessUnit, Account, Project } = item;
    if (!acc[businessUnit]) {
      acc[businessUnit] = {};
    }
    if (!acc[businessUnit][Account]) {
      acc[businessUnit][Account] = [];
    }
    acc[businessUnit][Account].push(Project);
    return acc;
  }, {});

  const handleSelect = (businessUnit, account, project) => {
    setSelection(`Business Unit: ${businessUnit}, Account: ${account}, Project: ${project}`);
  };*/

  return (
    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
    >
      <h3>{props.headerText}</h3>
      
      
    </Styles>
  );
}

/*{Object.keys(groupedData).map((businessUnit) => (
        <Dropdown title={businessUnit} key={businessUnit}>
          {Object.keys(groupedData[businessUnit]).map((account) => (
            <Dropdown.Item key={account}>
              {account}
              <Dropdown.Submenu>
                {groupedData[businessUnit][account].map((project) => (
                  <Dropdown.Item
                    key={project}
                    onClick={() => handleSelect(businessUnit, account, project)}
                  >
                    {project}
                  </Dropdown.Item>
                ))}
              </Dropdown.Submenu>
            </Dropdown.Item>
          ))}
        </Dropdown>
      ))}
        
      <div className="selection">{selection}</div>*/