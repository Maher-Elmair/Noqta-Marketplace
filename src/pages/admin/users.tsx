/**
 * Admin Users Management Page
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslation } from '@/hooks/use-translation'
import { mockUsers } from '@/services/mock-data'
import { USER_ROLES } from '@/lib/constants'
import { useToast } from '@/components/ui/use-toast'
import type { UserRole } from '@/lib/constants'

export function AdminUsersPage() {
  const t = useTranslation()
  const { toast } = useToast()
  
  // Initialize with mock users
  const [users, setUsers] = useState(mockUsers)

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    // Optimistically update local state
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    
    // Simulate API call
    toast({
        title: t('common.success'),
        description: t('admin.userRoleUpdated'),
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
            {t('admin.usersManagement')}
        </h1>
        <Button disabled>
            {t('admin.inviteUser')}
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>{t('admin.allUsers')}</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('admin.name')}</TableHead>
                        <TableHead>{t('admin.email')}</TableHead>
                        <TableHead>{t('admin.role')}</TableHead>
                        <TableHead className="text-right">{t('admin.actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                                      user.role === 'seller' ? 'bg-blue-100 text-blue-800' : 
                                      'bg-green-100 text-green-800'}`}>
                                    {user.role === 'admin' ? t('profile.admin') : user.role === 'seller' ? t('profile.seller') : t('profile.buyer')}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <Select
                                    value={user.role}
                                    onValueChange={(val) => handleRoleChange(user.id, val as UserRole)}
                                >
                                    <SelectTrigger className="w-[120px] ml-auto">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={USER_ROLES.BUYER}>{t('profile.buyer')}</SelectItem>
                                        <SelectItem value={USER_ROLES.SELLER}>{t('profile.seller')}</SelectItem>
                                        <SelectItem value={USER_ROLES.ADMIN}>{t('profile.admin')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
      
    </div>
  )
}
