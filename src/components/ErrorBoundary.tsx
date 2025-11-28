import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md glass-morphism shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-center text-destructive">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground mt-2 text-center">
                <p>
                  We're sorry, but an error occurred while rendering this view.
                </p>
                <div className="mt-4 p-4 bg-card rounded-md overflow-auto text-sm">
                  <pre>{this.state.error?.message || "Unknown error"}</pre>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button
                onClick={this.handleReset}
                className="flex items-center gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                Try Again
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
