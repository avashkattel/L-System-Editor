import { Button, Flex, Input, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverHeader, PopoverBody, Stack, Text, IconButton } from "@chakra-ui/react";
import { useStore } from "../store";

export function RuleEditor() {
    const { rules, addRule, removeRule, updateRuleValue } = useStore();

    return (
        <Popover placement="bottom-start">
            <PopoverTrigger>
                <Button size="sm">Edit Rules</Button>
            </PopoverTrigger>
            <PopoverContent bg="#222226" borderColor="#3a3d4b">
                <PopoverArrow bg="#222226" />
                <PopoverCloseButton />
                <PopoverHeader>L-System Rules</PopoverHeader>
                <PopoverBody>
                    <Stack spacing={2}>
                        {Object.entries(rules).map(([key, value]) => (
                            <Flex key={key} align="center" gap={2}>
                                <Text w="50px" textAlign="right" color="#61afef" fontFamily="monospace">{key} →</Text>
                                <Input 
                                    size="sm"
                                    value={value} 
                                    onChange={(e) => updateRuleValue(key, e.target.value)}
                                />
                                <IconButton 
                                    size="xs" 
                                    aria-label="Remove Rule" 
                                    icon={<Text>x</Text>} 
                                    onClick={() => removeRule(key)}
                                />
                            </Flex>
                        ))}
                        <Button size="sm" colorScheme="teal" onClick={() => {
                            const newKey = prompt("Enter new rule character (e.g., G, X, Y):");
                            if (newKey && newKey.length === 1 && !rules.hasOwnProperty(newKey)) {
                                addRule(newKey);
                            } else if (newKey) {
                                alert("Invalid or existing key. Please use a single, unique character.");
                            }
                        }}>+ Add Rule</Button>
                    </Stack>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    );
}