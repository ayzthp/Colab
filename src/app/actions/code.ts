"use server";

export async function runCode(
  code: string,
  input: string
): Promise<{ output: string; error: string }> {
  // In a real-world application, this would call a secure, sandboxed code execution environment.
  // For this demonstration, we are simulating the execution to show the flow.
  try {
    // Simulate network latency and execution time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simple mock logic based on code content
    if (code.toLowerCase().includes("reverse")) {
      return {
        output: `Simulated output (reversed input):\n${input.split("").reverse().join("")}`,
        error: "",
      };
    }
    if (code.toLowerCase().includes("hello")) {
      return { 
        output: `Simulated output:\nHello, ${input || "World"}!`, 
        error: "" 
      };
    }
    if (code.toLowerCase().includes("error")) {
        return {
            output: "",
            error: "Simulated execution error: Something went wrong!"
        }
    }

    return {
      output: `Simulated output for code:\n\n---\n${code}\n---\n\nwith input:\n\n---\n${input}\n---`,
      error: "",
    };
  } catch (e) {
    return { 
      output: "", 
      error: e instanceof Error ? e.message : "An unknown server error occurred." 
    };
  }
}
