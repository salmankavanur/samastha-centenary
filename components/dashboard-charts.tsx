"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Sample data - in a real app, this would come from an API
const contributionData = [
  { name: "Jan", value: 12 },
  { name: "Feb", value: 18 },
  { name: "Mar", value: 15 },
  { name: "Apr", value: 22 },
  { name: "May", value: 30 },
  { name: "Jun", value: 25 },
  { name: "Jul", value: 35 },
]

const userGrowthData = [
  { name: "Jan", value: 40 },
  { name: "Feb", value: 45 },
  { name: "Mar", value: 52 },
  { name: "Apr", value: 58 },
  { name: "May", value: 64 },
  { name: "Jun", value: 72 },
  { name: "Jul", value: 80 },
]

export default function DashboardCharts() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Analytics Overview</CardTitle>
        <CardDescription>Track contributions and user growth over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="contributions">
          <TabsList className="mb-4">
            <TabsTrigger value="contributions">Contributions</TabsTrigger>
            <TabsTrigger value="users">User Growth</TabsTrigger>
          </TabsList>
          <TabsContent value="contributions">
            <ChartContainer
              config={{
                value: {
                  label: "Contributions",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={contributionData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-value)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="users">
            <ChartContainer
              config={{
                value: {
                  label: "Users",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-value)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
