package io.github.azaky.nimfinder.data.processor;

/**
 * Created by Toshiba on 9/12/2015.
 */
public class StudentAggregateData {

    public static final StudentAggregateData TPB = new StudentAggregateData(1, 0, 0);
    public static final StudentAggregateData NON_TPB = new StudentAggregateData(0, 1, 0);
    public static final StudentAggregateData BOTH = new StudentAggregateData(0, 0, 1);

    private final int totalTpb;
    private final int totalNonTpb;
    private final int totalBoth;

    public StudentAggregateData(int totalTpb, int totalNonTpb, int totalBoth) {
        this.totalTpb = totalTpb;
        this.totalNonTpb = totalNonTpb;
        this.totalBoth = totalBoth;
    }

    public int getTotal() {
        return totalTpb + totalNonTpb + totalBoth;
    }

    public int getTotalTpb() {
        return totalTpb;
    }

    public int getTotalNonTpb() {
        return totalNonTpb;
    }

    public int getTotalBoth() {
        return totalBoth;
    }

    public StudentAggregateData add(StudentAggregateData metrics) {
        return new StudentAggregateData(
                this.totalTpb + metrics.totalTpb,
                this.totalNonTpb + metrics.totalNonTpb,
                this.totalBoth + metrics.totalBoth);
    }
}
