class mergeSort{
    public static void main(String[] args) {
        int[] arr = {5, 4, 1, 3, 2};
        mergeSort(arr);
        for(int i: arr){
            System.out.print(i+" ");
        }
    }
    public static void mergeSort(int [] arr) {
        int n = arr.length;
        if(n==1) return;
        //Step 1: divide the array into 2 halves
        int [] a = new int[n/2];
        int [] b = new int[n - n/2];

        //Step 2: copy the elements into the halves
        int idx = 0;
        for(int i=0;i<a.length;i++){
            a[i] = arr[idx++];
        }
        for(int i=0;i<b.length;i++){
            b[i] = arr[idx++];
        }

        //step 3 magic/sorting the halves
        mergeSort(a);
        mergeSort(b);
        
        //step 4: merge the halves
        merge(a, b, arr);
    }
    public static void merge(int [] a, int [] b, int [] arr) {
        int i=0,j=0,k=0;
        while(i<a.length && j<b.length){
            if(a[i]<b[j]){
                arr[k++] = a[i++];
            }else{
                arr[k++] = b[j++];
            }
        }
        // Copy any remaining elements from either array
        while(i < a.length) {
            arr[k++] = a[i++];
        }
        while(j < b.length) {
            arr[k++] = b[j++];
        }
    }
}