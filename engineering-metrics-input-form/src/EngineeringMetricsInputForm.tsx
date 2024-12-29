import React from 'react';
import { styled } from '@superset-ui/core';

const Styles = styled.div`
  display: flex;
  justify-content: space-around;
  gap: 20px;
  padding: 20px;

  .business-unit {
    position: relative;
    display: inline-block;

    .dropdown {
      margin-top: 10px;
      cursor: pointer;
    }

    ul {
      list-style-type: none;
      padding: 0;
      margin: 0;
      position: absolute;
      background-color: #fff;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      border-radius: 5px;
      z-index: 10;
      display: none;

      li {
        padding: 10px;
        cursor: pointer;

        &:hover {
          background-color: #f0f0f0;
        }

        .nested-dropdown {
          position: relative;

          ul {
            position: absolute;
            left: 100%;
            top: 0;
            display: none;
          }

          &:hover > ul {
            display: block;
          }
        }
      }
    }

    &:hover > ul {
      display: block;
    }
  }
`;

export default function MultiLevelDropdown({ data }) {
  const businessUnits = [...new Set(data.map(item => item['Business Unit']))];

  const getAccountsForBusinessUnit = businessUnit =>
    [...new Set(data.filter(item => item['Business Unit'] === businessUnit).map(item => item.Account))];

  const getProjectsForAccount = (businessUnit, account) =>
    [...new Set(data.filter(item => item['Business Unit'] === businessUnit && item.Account === account).map(item => item.Project))];

  return (
    <Styles>
      {businessUnits.map(businessUnit => {
        const accounts = getAccountsForBusinessUnit(businessUnit);

        return (
          <div key={businessUnit} className="business-unit">
            <button className="dropdown">{businessUnit}</button>
            <ul>
              {accounts.map(account => {
                const projects = getProjectsForAccount(businessUnit, account);

                return (
                  <li key={account} className="nested-dropdown">
                    {account}
                    {projects.length > 0 && (
                      <ul>
                        {projects.map(project => (
                          <li key={project}>{project}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </Styles>
  );
}
