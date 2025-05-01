
import { useState } from "react";

interface JsonViewProps {
  data: any;
  level?: number;
  path?: string;
}

export const JsonView = ({ data, level = 0, path = "" }: JsonViewProps) => {
  const [expanded, setExpanded] = useState(level < 2);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  if (data === null) {
    return <span className="json-null">null</span>;
  }

  if (typeof data === "boolean") {
    return <span className="json-boolean">{data.toString()}</span>;
  }

  if (typeof data === "number") {
    return <span className="json-number">{data}</span>;
  }

  if (typeof data === "string") {
    return <span className="json-string">"{data}"</span>;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span>[]</span>;
    }

    return (
      <div>
        <span className="expand-button" onClick={toggleExpand}>
          {expanded ? "▼" : "►"}
        </span>
        <span>[</span>
        {expanded ? (
          <div className="pl-4 border-l border-border/30">
            {data.map((item, index) => (
              <div key={`${path}.${index}`}>
                <JsonView data={item} level={level + 1} path={`${path}.${index}`} />
                {index < data.length - 1 && <span>,</span>}
              </div>
            ))}
          </div>
        ) : (
          <span> ... </span>
        )}
        <span>]</span>
      </div>
    );
  }

  if (typeof data === "object") {
    const keys = Object.keys(data);
    
    if (keys.length === 0) {
      return <span>{"{}"}</span>;
    }

    return (
      <div>
        <span className="expand-button" onClick={toggleExpand}>
          {expanded ? "▼" : "►"}
        </span>
        <span>{"{"}</span>
        {expanded ? (
          <div className="pl-4 border-l border-border/30">
            {keys.map((key, index) => (
              <div key={`${path}.${key}`}>
                <span className="json-key">{key}</span>
                <span>: </span>
                <JsonView 
                  data={data[key]} 
                  level={level + 1} 
                  path={`${path}.${key}`}
                />
                {index < keys.length - 1 && <span>,</span>}
              </div>
            ))}
          </div>
        ) : (
          <span> ... </span>
        )}
        <span>{"}"}</span>
      </div>
    );
  }

  return <span>{String(data)}</span>;
};
