import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Modal,
    ActivityIndicator,
    StyleSheet,
    RefreshControl,
    Pressable,
} from 'react-native';
import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChainService, Chain, ChainType } from '../../../services/chains';
import { censorName } from '../../../services/utils';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// --- Colors ---
const COLORS = {
    primary: '#01241e',
    card: '#032b23',
    accent: '#70c5bb',
    gold: '#D4AF37',
    muted: '#4a7a72',
    text: '#a8c5bf',
};

// --- Type filter tabs ---
type FilterTab = 'all' | ChainType | 'toplu_dua';

interface FilterTabItem {
    key: FilterTab;
    label: string;
}

const FILTER_TABS: FilterTabItem[] = [
    { key: 'all', label: 'Tümü' },
    { key: 'hatim', label: 'Hatim' },
    { key: 'salavat', label: 'Salavat' },
    { key: 'sure', label: 'Sure' },
    { key: 'dua', label: 'Dua' },
    { key: 'toplu_dua', label: 'Toplu Dua' },
];

// --- Sort options ---
type SortKey =
    | 'newest'
    | 'oldest'
    | 'ending_soon'
    | 'ending_late'
    | 'most_participants'
    | 'least_participants';

interface SortOption {
    key: SortKey;
    label: string;
    icon: string;
}

const SORT_OPTIONS: SortOption[] = [
    { key: 'newest', label: 'En yeni', icon: 'arrow-down-outline' },
    { key: 'oldest', label: 'En eski', icon: 'arrow-up-outline' },
    { key: 'ending_soon', label: 'Bitime en az kalan', icon: 'hourglass-outline' },
    { key: 'ending_late', label: 'Bitime en çok kalan', icon: 'time-outline' },
    { key: 'most_participants', label: 'En çok katılımcı', icon: 'people-outline' },
    { key: 'least_participants', label: 'En az katılımcı', icon: 'person-outline' },
];

// --- Icon per chain type ---
function getChainIcon(type: string): string {
    switch (type) {
        case 'hatim': return 'book';
        case 'salavat': return 'heart';
        case 'sure': return 'document-text';
        case 'dua': return 'hand-left';
        default: return 'link-outline';
    }
}

// --- Type label ---
function getChainTypeLabel(type: string): string {
    switch (type) {
        case 'hatim': return 'Hatim';
        case 'salavat': return 'Salavat';
        case 'sure': return 'Sure';
        case 'dua': return 'Dua';
        default: return type;
    }
}

// --- Format remaining days ---
function getRemainingDays(endDate: string): { text: string; urgent: boolean } {
    const now = new Date();
    const end = new Date(endDate);
    const diffMs = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Süresi doldu', urgent: true };
    if (diffDays === 0) return { text: 'Bugün bitiyor', urgent: true };
    if (diffDays === 1) return { text: '1 gün kaldı', urgent: true };
    if (diffDays <= 3) return { text: `${diffDays} gün kaldı`, urgent: true };
    return { text: `${diffDays} gün kaldı`, urgent: false };
}

// --- Format date for display ---
function formatDisplayDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

export default function ChainsScreen() {
    const [chains, setChains] = useState<Chain[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
    const [sortKey, setSortKey] = useState<SortKey>('newest');
    const [showSortModal, setShowSortModal] = useState(false);

    // --- Load data ---
    const loadChains = useCallback(async () => {
        try {
            const allChains = await ChainService.getChains();
            setChains(allChains);
        } catch (e) {
            console.error('Failed to load chains:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            loadChains();
        }, [loadChains])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadChains();
        setRefreshing(false);
    }, [loadChains]);

    // --- Filtered + Sorted chains ---
    const filteredAndSortedChains = useMemo(() => {
        let result = [...chains];

        // 1) Filter by type
        if (activeFilter !== 'all') {
            if (activeFilter === 'toplu_dua') {
                // Toplu Dua: show chains of type 'dua' that have more than 1 participant
                result = result.filter(c => c.type === 'dua' && c.participants.length > 1);
            } else {
                result = result.filter(c => c.type === activeFilter);
            }
        }

        // 2) Filter by search query (title + description + createdByName)
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            result = result.filter(c =>
                c.title.toLowerCase().includes(q) ||
                c.description.toLowerCase().includes(q) ||
                c.createdByName.toLowerCase().includes(q)
            );
        }

        // 3) Sort
        result.sort((a, b) => {
            switch (sortKey) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'ending_soon':
                    return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
                case 'ending_late':
                    return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
                case 'most_participants':
                    return b.participants.length - a.participants.length;
                case 'least_participants':
                    return a.participants.length - b.participants.length;
                default:
                    return 0;
            }
        });

        return result;
    }, [chains, activeFilter, searchQuery, sortKey]);

    // --- Current sort label ---
    const currentSortLabel = SORT_OPTIONS.find(o => o.key === sortKey)?.label ?? 'En yeni';

    // --- Render a single chain card ---
    const renderChainCard = useCallback(({ item }: { item: Chain }) => {
        const progress = ChainService.getProgress(item);
        const remaining = getRemainingDays(item.endDate);

        return (
            <TouchableOpacity
                style={styles.chainCard}
                onPress={() => router.push(`/chain/${item.id}`)}
                activeOpacity={0.7}
            >
                <View style={styles.chainCardRow}>
                    {/* Icon */}
                    <View style={[
                        styles.chainIconContainer,
                        item.isCompleted && { backgroundColor: 'rgba(212,175,55,0.12)' },
                    ]}>
                        <Ionicons
                            name={item.isCompleted ? 'checkmark-circle' : getChainIcon(item.type) as any}
                            size={24}
                            color={item.isCompleted ? COLORS.gold : COLORS.accent}
                        />
                    </View>

                    {/* Content */}
                    <View style={styles.chainCardContent}>
                        {/* Type badge + title row */}
                        <View style={styles.chainTitleRow}>
                            <View style={styles.typeBadge}>
                                <Text style={styles.typeBadgeText}>{getChainTypeLabel(item.type)}</Text>
                            </View>
                            {item.isCompleted && (
                                <View style={styles.completedBadge}>
                                    <Ionicons name="checkmark-circle" size={12} color={COLORS.gold} />
                                    <Text style={styles.completedBadgeText}>Tamamlandı</Text>
                                </View>
                            )}
                        </View>

                        <Text style={styles.chainTitle} numberOfLines={1}>{item.title}</Text>

                        {/* Creator name (censored) */}
                        <Text style={styles.chainCreator}>{censorName(item.createdByName)}</Text>

                        {/* Progress bar */}
                        <View style={styles.progressBarContainer}>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${progress.percent}%` }]} />
                            </View>
                            <Text style={styles.progressText}>%{progress.percent}</Text>
                        </View>

                        {/* Bottom row: participants + end date */}
                        <View style={styles.chainMetaRow}>
                            <View style={styles.metaItem}>
                                <Ionicons name="people-outline" size={13} color={COLORS.muted} />
                                <Text style={styles.metaText}>{item.participants.length} katılımcı</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Ionicons
                                    name="calendar-outline"
                                    size={13}
                                    color={remaining.urgent ? '#ef4444' : COLORS.muted}
                                />
                                <Text style={[
                                    styles.metaText,
                                    remaining.urgent && { color: '#ef4444' },
                                ]}>
                                    {remaining.text}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Chevron */}
                    <Ionicons name="chevron-forward" size={18} color={COLORS.muted} style={{ marginLeft: 4 }} />
                </View>
            </TouchableOpacity>
        );
    }, []);

    // --- Empty state ---
    const renderEmptyState = () => {
        if (loading) return null;

        return (
            <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={COLORS.muted} />
                <Text style={styles.emptyTitle}>
                    {searchQuery.trim() ? 'Sonuç bulunamadı' : 'Henüz zincir yok'}
                </Text>
                <Text style={styles.emptySubtitle}>
                    {searchQuery.trim()
                        ? 'Arama kriterlerinize uygun zincir bulunamadı. Farklı bir arama deneyin.'
                        : 'İlk zinciri oluşturarak başlayın!'
                    }
                </Text>
                {!searchQuery.trim() && (
                    <TouchableOpacity
                        style={styles.emptyCreateButton}
                        onPress={() => router.push('/chain/create')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
                        <Text style={styles.emptyCreateText}>Zincir Oluştur</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    // --- Header (search + filters + sort) ---
    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Search bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color={COLORS.muted} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Zincir ara (başlık, açıklama, oluşturan...)"
                    placeholderTextColor={COLORS.muted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    returnKeyType="search"
                    autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity
                        onPress={() => setSearchQuery('')}
                        style={styles.clearButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close-circle" size={18} color={COLORS.muted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Filter tabs + sort button row */}
            <View style={styles.filterSortRow}>
                {/* Filter tabs (scrollable) */}
                <FlatList
                    data={FILTER_TABS}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.key}
                    contentContainerStyle={styles.filterTabsContainer}
                    renderItem={({ item }) => {
                        const isActive = activeFilter === item.key;
                        return (
                            <TouchableOpacity
                                style={[styles.filterTab, isActive && styles.filterTabActive]}
                                onPress={() => setActiveFilter(item.key)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />

                {/* Sort button */}
                <TouchableOpacity
                    style={styles.sortButton}
                    onPress={() => setShowSortModal(true)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="swap-vertical-outline" size={18} color={COLORS.accent} />
                    <Text style={styles.sortButtonText} numberOfLines={1}>{currentSortLabel}</Text>
                </TouchableOpacity>
            </View>

            {/* Result count */}
            <View style={styles.resultCountRow}>
                <Text style={styles.resultCountText}>
                    {filteredAndSortedChains.length} zincir bulundu
                </Text>
            </View>
        </View>
    );

    // --- Footer (banner ad) ---
    const renderFooter = () => (
        <View style={styles.footerContainer}>
            <View style={styles.adContainer}>
                <BannerAd
                    unitId={TestIds.BANNER}
                    size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                />
            </View>
            {/* Extra spacing for FAB */}
            <View style={{ height: 80 }} />
        </View>
    );

    // --- RENDER ---
    return (
        <View style={styles.container}>
            {loading && chains.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.accent} />
                    <Text style={styles.loadingText}>Zincirler yükleniyor...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredAndSortedChains}
                    renderItem={renderChainCard}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={renderEmptyState}
                    ListFooterComponent={renderFooter}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={COLORS.accent}
                            colors={[COLORS.accent]}
                        />
                    }
                />
            )}

            {/* ========== FAB - Create new chain ========== */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/chain/create')}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>

            {/* ========== Sort Modal (Bottom Sheet) ========== */}
            <Modal
                visible={showSortModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowSortModal(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowSortModal(false)}
                >
                    <Pressable style={styles.modalSheet} onPress={() => { }}>
                        {/* Handle bar */}
                        <View style={styles.modalHandle} />

                        {/* Title */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Sıralama</Text>
                            <TouchableOpacity
                                onPress={() => setShowSortModal(false)}
                                style={styles.modalCloseButton}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="close" size={22} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Sort options */}
                        {SORT_OPTIONS.map((option) => {
                            const isSelected = sortKey === option.key;
                            return (
                                <TouchableOpacity
                                    key={option.key}
                                    style={[styles.sortOptionItem, isSelected && styles.sortOptionItemActive]}
                                    onPress={() => {
                                        setSortKey(option.key);
                                        setShowSortModal(false);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <View style={[
                                        styles.sortOptionIcon,
                                        isSelected && styles.sortOptionIconActive,
                                    ]}>
                                        <Ionicons
                                            name={option.icon as any}
                                            size={20}
                                            color={isSelected ? COLORS.accent : COLORS.muted}
                                        />
                                    </View>
                                    <Text style={[
                                        styles.sortOptionLabel,
                                        isSelected && styles.sortOptionLabelActive,
                                    ]}>
                                        {option.label}
                                    </Text>
                                    {isSelected && (
                                        <Ionicons name="checkmark-circle" size={22} color={COLORS.accent} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}

                        {/* Bottom safe area spacing */}
                        <View style={{ height: 20 }} />
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primary,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        color: COLORS.text,
        fontSize: 14,
    },

    // --- Header ---
    headerContainer: {
        paddingTop: 12,
        paddingBottom: 8,
    },

    // Search bar
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(112,197,187,0.1)',
        paddingHorizontal: 14,
        marginBottom: 12,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 15,
        color: '#fff',
    },
    clearButton: {
        padding: 4,
        marginLeft: 4,
    },

    // Filter tabs + sort row
    filterSortRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    filterTabsContainer: {
        paddingRight: 8,
        gap: 6,
    },
    filterTab: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: 'rgba(112,197,187,0.1)',
    },
    filterTabActive: {
        backgroundColor: 'rgba(112,197,187,0.15)',
        borderColor: COLORS.accent,
    },
    filterTabText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.muted,
    },
    filterTabTextActive: {
        color: COLORS.accent,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 9,
        marginLeft: 6,
        borderWidth: 1,
        borderColor: 'rgba(112,197,187,0.15)',
        gap: 6,
    },
    sortButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.accent,
        maxWidth: 80,
    },

    // Result count
    resultCountRow: {
        marginBottom: 6,
        marginTop: 2,
    },
    resultCountText: {
        fontSize: 12,
        color: COLORS.muted,
        fontWeight: '500',
    },

    // --- Chain card ---
    chainCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(112,197,187,0.08)',
    },
    chainCardRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chainIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(112,197,187,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    chainCardContent: {
        flex: 1,
    },
    chainTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    typeBadge: {
        backgroundColor: 'rgba(112,197,187,0.15)',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    typeBadgeText: {
        fontSize: 10,
        color: COLORS.accent,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    completedBadgeText: {
        fontSize: 10,
        color: COLORS.gold,
        fontWeight: '600',
    },
    chainTitle: {
        fontSize: 15,
        color: '#fff',
        fontWeight: '700',
        marginBottom: 2,
    },
    chainCreator: {
        fontSize: 12,
        color: COLORS.muted,
        marginBottom: 8,
    },
    progressBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    progressBarBg: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(112,197,187,0.15)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: 4,
        backgroundColor: COLORS.accent,
        borderRadius: 2,
    },
    progressText: {
        fontSize: 12,
        color: COLORS.accent,
        fontWeight: '700',
        minWidth: 32,
        textAlign: 'right',
    },
    chainMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 11,
        color: COLORS.muted,
        fontWeight: '500',
    },

    // --- Empty state ---
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 24,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.muted,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    emptyCreateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.accent,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 14,
        marginTop: 20,
        gap: 8,
    },
    emptyCreateText: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.primary,
    },

    // --- Footer ---
    footerContainer: {
        marginTop: 8,
    },
    adContainer: {
        alignItems: 'center',
        borderRadius: 8,
        overflow: 'hidden',
    },

    // --- FAB ---
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.accent,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },

    // --- Sort Modal ---
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalSheet: {
        backgroundColor: COLORS.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 24,
    },
    modalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.muted,
        alignSelf: 'center',
        marginBottom: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    modalCloseButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(112,197,187,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sortOptionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 14,
        marginBottom: 4,
    },
    sortOptionItemActive: {
        backgroundColor: 'rgba(112,197,187,0.08)',
    },
    sortOptionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(112,197,187,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    sortOptionIconActive: {
        backgroundColor: 'rgba(112,197,187,0.15)',
    },
    sortOptionLabel: {
        flex: 1,
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '500',
    },
    sortOptionLabelActive: {
        color: COLORS.accent,
        fontWeight: '700',
    },
});
