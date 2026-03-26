'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProductAction, updateProductAction, deleteProductAction } from '@/actions/product';
import { uploadImageAction } from '@/actions/upload';
import { toast } from 'sonner';
import { 
    Save, 
    Upload, 
    Image as ImageIcon, 
    Trash2, 
    Loader2, 
    Tag, 
    Type, 
    DollarSign, 
    Box, 
    CheckCircle2,
    XCircle,
    Settings
} from 'lucide-react';

interface ProductFormProps {
    tenant: any;
    product?: any;
    dict: any;
}

export default function ProductForm({ tenant, product, dict }: ProductFormProps) {
    const t = dict.admin.product_form;
    const router = useRouter();
    const isEdit = !!product;

    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState(product?.imageUrl || '');

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await uploadImageAction(formData, 'products');
            if (result.success && result.url) {
                setImageUrl(result.url);
                toast.success(t.toast_upload_success);
            } else {
                toast.error(result.error || t.toast_upload_error);
            }
        } catch (error) {
            toast.error(t.toast_upload_fatal);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        formData.append('imageUrl', imageUrl);

        try {
            const result = isEdit 
                ? await updateProductAction(product.id, formData)
                : await createProductAction(formData);

            if (result.success) {
                toast.success(isEdit ? t.toast_update_success : t.toast_create_success);
                router.push(`/${tenant.slug}/admin/products`);
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(t.confirm_delete)) return;
        
        setIsDeleting(true);
        try {
            const result = await deleteProductAction(product.id);
            if (result.success) {
                toast.success(t.toast_delete_success);
                router.push(`/${tenant.slug}/admin/products`);
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Basic Info */}
                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                            <Type size={16} /> {t.name}
                        </label>
                        <input
                            type="text"
                            name="name"
                            defaultValue={product?.name}
                            required
                            placeholder={t.name_placeholder}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                                <DollarSign size={16} /> {t.price} ({tenant.config.currency || 'IDR'})
                            </label>
                            <input
                                type="number"
                                name="price"
                                defaultValue={product?.price}
                                required
                                min="0"
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                                <Box size={16} /> {t.stock}
                            </label>
                            <input
                                type="number"
                                name="stock"
                                defaultValue={product?.stock || 0}
                                min="0"
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                            <Tag size={16} /> {t.category}
                        </label>
                        <input 
                            type="text"
                            name="category" 
                            list="categoryList"
                            defaultValue={product?.category?.name || 'Cake'}
                            placeholder="e.g. Cake, Pastry, Custom..."
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white' }}
                        />
                        <datalist id="categoryList">
                            <option value="Cake" />
                            <option value="Pastry" />
                            <option value="Bread" />
                            <option value="Cookies" />
                            <option value="Beverage" />
                        </datalist>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t.description}</label>
                        <textarea
                            name="description"
                            defaultValue={product?.description}
                            rows={4}
                            required
                            placeholder={t.desc_placeholder}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', resize: 'vertical' }}
                        />
                    </div>
                </div>

                {/* Media Section */}
                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                        <ImageIcon size={16} /> {t.photo}
                    </label>
                    <div style={{
                        width: '100%',
                        aspectRatio: '4/3',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '2px dashed #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        {imageUrl ? (
                            <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                                <ImageIcon size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <div style={{ fontSize: '0.85rem' }}>{t.upload_hint}</div>
                            </div>
                        )}
                        {isUploading && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Loader2 size={32} className="spinner" style={{ color: tenant.theme.primary }} />
                            </div>
                        )}
                    </div>
                    <label style={{
                        cursor: 'pointer',
                        background: '#334155',
                        color: 'white',
                        padding: '0.8rem 1.5rem',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'opacity 0.2s',
                        opacity: isUploading ? 0.7 : 1
                    }}>
                        <Upload size={18} /> {imageUrl ? t.btn_change : t.btn_upload}
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={isUploading} />
                    </label>

                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Settings size={18} /> {t.options_title}
                        </h4>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                            <input 
                                type="checkbox" 
                                name="isActive" 
                                defaultChecked={product ? product.isActive : true} 
                                value="true"
                                style={{ width: '18px', height: '18px' }}
                            />
                            <div>
                                <div style={{ fontWeight: 600 }}>{t.show_in_store}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{t.show_hint}</div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
                {isEdit && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isSaving || isDeleting}
                        style={{
                            background: 'none',
                            border: '1px solid #fecaca',
                            color: '#ef4444',
                            padding: '0.8rem 1.5rem',
                            borderRadius: '10px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer'
                        }}
                    >
                        {isDeleting ? <Loader2 size={18} className="spinner" /> : <Trash2 size={18} />}
                        {t.btn_delete}
                    </button>
                )}
                
                <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        style={{
                            background: '#f1f5f9',
                            border: 'none',
                            color: '#475569',
                            padding: '0.8rem 1.5rem',
                            borderRadius: '10px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        {t.btn_cancel}
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving || isUploading || isDeleting}
                        style={{
                            background: tenant.theme.primary,
                            border: 'none',
                            color: 'white',
                            padding: '0.8rem 2rem',
                            borderRadius: '10px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            opacity: (isSaving || isUploading || isDeleting) ? 0.7 : 1
                        }}
                    >
                        {isSaving ? <Loader2 size={18} className="spinner" /> : <Save size={18} />}
                        {isEdit ? t.btn_save : t.btn_add}
                    </button>
                </div>
            </div>
        </form>
    );
}
