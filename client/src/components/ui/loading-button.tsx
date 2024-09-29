import { Button } from "@/components/ui/button";

export default function LoadingButton({pending} : {pending: boolean}) {
    return (
        <Button variant="default" size="default" asChild>
            {pending ? "Loading..." : "Log In"}
        </Button>
    )
}